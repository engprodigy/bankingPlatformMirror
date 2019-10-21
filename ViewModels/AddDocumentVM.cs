using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using TheCoreBanking.Retail.Data.Models;

namespace TheCoreBanking.Retail.ViewModels
{
    public class AddCustomerVM
    {
        /*public TblCustomer customer;
        public List<TblCustomeremailcontact> emails;
        public List<TblCustomerphonecontact> phones;
        public List<TblCustomeraddress> addresses;
        public List<TblCustomeraccountkycitem> kyc;*/
    }

    public class AccompanyDocumentVM
    {
        public IFormFile Document { get; set; }
        public string Title { get; set; }
    }
}