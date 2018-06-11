using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    public class AuthController: Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IAuthRepository _repo;

        public readonly IMapper _mapper;

        public AuthController(IAuthRepository repo,IConfiguration configuration, IMapper mapper)
        {
            _configuration= configuration;
            _repo=repo;
            _mapper= mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody]UserForRegisterDto userforRegisterDto)
        {
            if(!string.IsNullOrEmpty(userforRegisterDto.Username))
                userforRegisterDto.Username=userforRegisterDto.Username.ToLower();

            if(await _repo.UserExist(userforRegisterDto.Username))
            ModelState.AddModelError("Username","Username is already taken");

            //validate request
            if(!ModelState.IsValid)
                return BadRequest(ModelState);

           

            var userToCreate= Mapper.Map<User>(userforRegisterDto);

            var createUser= await _repo.Register(userToCreate,userforRegisterDto.Password);
            var userToReturn = Mapper.Map<UserForDetailedDto>(createUser);

            return CreatedAtRoute("GetUser",new {controller = "Users", id = createUser.Id},userToReturn);

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserForLoginDto userForLoginDto)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
                
            var userfromRepo=await _repo.Login(userForLoginDto.Username,userForLoginDto.Password);

            if(userfromRepo == null)
                return Unauthorized();
            
            //generating token
            var tokenHandler= new JwtSecurityTokenHandler();
            var key= Encoding.ASCII.GetBytes(_configuration.GetSection("AppSettings:Token").Value);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject= new ClaimsIdentity(new Claim[]
                {
                   new Claim(ClaimTypes.NameIdentifier,userfromRepo.Id.ToString()),
                   new Claim(ClaimTypes.Name, userfromRepo.Username)     
                }),
                Expires= DateTime.Now.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),SecurityAlgorithms.HmacSha512Signature)
            };

            var token= tokenHandler.CreateToken(tokenDescriptor);
            var tokenString=tokenHandler.WriteToken(token);

            var user = _mapper.Map<UserForListDto>(userfromRepo);

            return Ok(new {tokenString,user});
          
            
        }
    }
}