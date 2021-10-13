using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/file")]
    public class FileController : ControllerBase
    {
        private readonly ILogger<FileController> _logger;
        public FileController(ILogger<FileController> logger)
        {
            _logger = logger;
        }

        [HttpPatch, DisableRequestSizeLimit]
        [Route("upload")]
        public IActionResult Upload()
        {
            try
            {
                System.Threading.Thread.Sleep(3000);
                var files = Request.Form.Files.ToList();
                var folderName = Path.Combine("Resources", "Files");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                var uploadedCnt = 0;
                files.ForEach(file =>
                {
                    if (file.Length > 0)
                    {
                        var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                        var fullPath = Path.Combine(pathToSave, fileName);
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        uploadedCnt++;
                    }
                });
                if (uploadedCnt == files.Count)
                    return Ok();
                else
                    return BadRequest();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpGet]
        [Route("list")]
        public IActionResult List()
        {
            try
            {
                System.Threading.Thread.Sleep(3000);
                var folderName = Path.Combine("Resources", "Files");
                var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                var list = Directory.GetFiles(pathToGet).ToList().Select(x =>
                {
                    return new FileInfo()
                    {
                        Path = x,
                        Name = Path.GetFileName(x),
                        CreatedAt = System.IO.File.GetCreationTime(x),
                        LastModified = System.IO.File.GetLastWriteTime(x),
                        Size = new System.IO.FileInfo(x).Length
                    };
                }).OrderByDescending(x => x.CreatedAt).ToList();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpGet]
        [Route("download")]
        public IActionResult GetFile([FromQuery] string filename)
        {
            try
            {
                System.Threading.Thread.Sleep(3000);
                if (string.IsNullOrWhiteSpace(filename))
                    return BadRequest();

                var folderName = Path.Combine("Resources", "Files");
                var pathToFolder = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                var filepath = Path.Combine(pathToFolder, filename);
                if (!System.IO.File.Exists(filepath))
                    return NotFound();

                new FileExtensionContentTypeProvider().TryGetContentType(filepath, out string contentType);
                if (contentType == null) contentType = "application/octet-stream";
                return PhysicalFile(filepath, contentType, Path.GetFileName(filepath));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromBody] List<string> filenames)
        {
            try
            {
                System.Threading.Thread.Sleep(3000);
                var listFolders = new List<string>();
                foreach (var x in filenames)
                {
                    if (string.IsNullOrWhiteSpace(x))
                        return BadRequest(x);

                    var folderName = Path.Combine("Resources", "Files");
                    var pathToFolder = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                    var filepath = Path.Combine(pathToFolder, x);
                    if (!System.IO.File.Exists(filepath))
                        return NotFound(filepath);

                    listFolders.Add(filepath);
                };

                listFolders.ForEach(x => { System.IO.File.Delete(x); });
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex}");
            }
        }
    }
}
