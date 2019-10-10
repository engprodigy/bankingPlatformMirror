using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TheCoreBanking.Retail.ImageUpload
{
    public class UploadFiles
    {
        public List<IFormFile> ImageFile { get; set; }
        public List<IFormFile> RelatedFile { get; set; }
        public string FileTitle { get; set; }
        public string FileRelatedTitle { get; set; }
        public string AccountId { get; set; }
    }
}
