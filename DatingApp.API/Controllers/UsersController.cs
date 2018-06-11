using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[Controller]")]
    public class UsersController: Controller
    {
        
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            _repo=repo;
            _mapper=mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers(UserParams userParams)
        {
            var currentUserId =  int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo= await _repo.GetUser(currentUserId);

            userParams.UserId=currentUserId;

            if(string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender= userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users=await _repo.GetUsers(userParams);

            var usersToReturn=_mapper.Map<IEnumerable<UserForListDto>>(users);

            Response.AddPagination(users.CurrentPage,users.PageSize,users.TotalCount,users.TotalPages);

            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name= "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user=await _repo.GetUser(id);
            var userToReturn= _mapper.Map<UserForDetailedDto>(user);
            return Ok(userToReturn);
        }
        [HttpPut ("{id}")]
        public async Task<IActionResult> UpdateUser(int id,[FromBody] UserForUpdateDto UserForUpdateDto)
        {
            if(!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var currentUserId =  int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userFromRepo= await _repo.GetUser(id);

            if(userFromRepo == null)
                return NotFound($"Could not found user with an ID of {id}");

            if(userFromRepo.Id != currentUserId)
                return Unauthorized();
            
            _mapper.Map(UserForUpdateDto,userFromRepo);
            if(await _repo.SaveAll())
                return NoContent();
            throw new Exception($"Updating user {id} failed on save");
        }
        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if(id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var like = await _repo.GetLike(id,recipientId);

            if(like!=null)
                return BadRequest("You already like this user");

            if(await _repo.GetUser(recipientId) == null)
                return NotFound();

            like = new Like{
                LikerId=id,
                LikeeId=recipientId
            };

            _repo.Add<Like>(like);

            if(await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed To Like User");

        }


    }
}