using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TheCoreBanking.Retail.Helpers
{
    public class ChartOfAccount
    {
        public int id { get; set; }
        public string accountId { get; set; }
        public string accountname { get; set; }
        public decimal balance { get; set; }
        public int acctTypeId { get; set; }
        public int categoryId { get; set; }
        public int groupId { get; set; }
        public string branchId { get; set; }
        public string username { get; set; }
       
    }

    public class Product
    {
        public string accountId { get; set; }
        public string accountname { get; set; }
        public string productName { get; set; }
        public string productDescription { get; set; }
        public decimal balance { get; set; }
    }


}
