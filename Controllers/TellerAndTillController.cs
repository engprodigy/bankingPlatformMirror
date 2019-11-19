using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using TheCoreBanking.Retail.Data.Contracts;
using TheCoreBanking.Retail.Data.Helpers;
using TheCoreBanking.Retail.Data.Models;
using TheCoreBanking.Retail.Helpers;
using TheCoreBanking.Retail.ImageUpload;
using TheCoreBanking.Retail.ViewModels;
using IdentityServer4.Extensions;

namespace TheCoreBanking.Retail.Controllers
{
    public class TellerAndTillController : Controller
    {
        private IRetailUnitOfWork RetailUnitOfWork { get; }



        public TellerAndTillController(IRetailUnitOfWork retailUnitOfWork)
        {
            RetailUnitOfWork = retailUnitOfWork;
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult Index()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult TellerOperation()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        [HttpGet]
        public IActionResult TellerPosting()
        {
            return View();
        }

        #region Add-On

        [HttpGet]
        public JsonResult GetTillType()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.tillType.GetAll();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Type
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetTillDefinition()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.tillDefinition.GetAll();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Tellername
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetOperationType()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.operationType.GetDetailed();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Operationname
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetTillFunction()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.tillFunction.GetAll();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Tillfunction
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetTillMapping()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.tillMapping.GetDetails();
            foreach(var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Tilldefinationname
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetTillLimitInfo()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.tillLimit.GetDetailed();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Tillname
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetAlreadyLoggedin(string id)
        {
            System.Threading.Thread.Sleep(200);
            var alreadyLogin = RetailUnitOfWork.tellerlogin
                .GetAll().Where(t => t.Username == id && t.Isactive == true)
                .FirstOrDefault();

            if (alreadyLogin != null) {
                return Json(1);               
            } else {
                return Json(0);
            }
        }

        [HttpGet]
        public JsonResult GetAlreadyLoggedinList()
        {
            

            var loggedUser = User.Identity.Name;

            if (User.Identity.Name == null)
            {
                loggedUser = "tayo.olawumi";

            }
            else
            {
                loggedUser = User.Identity.Name;
            }
                var alreadyLogin = RetailUnitOfWork.tellerlogin
                .GetAll().Where(t => t.Username == loggedUser && t.Isactive == true)
                .FirstOrDefault();

            if (alreadyLogin != null)
            {
                //System.Threading.Thread.Sleep(200);
                alreadyLogin.Isactive = false;
                RetailUnitOfWork.tellerlogin.Update(alreadyLogin);
                RetailUnitOfWork.Commit();
                return Json(1);
            }
            else
            {
                return Json(0);
            }
        }

        [HttpGet]
        public JsonResult GetAlreadyLoggedOut(int id)
        {
            System.Threading.Thread.Sleep(200);
            var alreadyLogin = RetailUnitOfWork.tellerlogin
                .GetAll().Where(t => t.Id == id && t.Isactive == true)
                .FirstOrDefault();

            if (alreadyLogin != null)
            {
                return Json(1);
            }
            else
            {
                return Json(0);
            }
        }

        [Authorize(Roles ="Teller")]
        public JsonResult GetTellerUserName(string id)
        {

            var userName = RetailUnitOfWork.tellerSetup.GetUserName(id).FirstOrDefault().Tilluser;

            if (userName != null)
            {
                return Json(true);
                
                
            }
            else
            {
                // return Json(false);
                return Json(NotFound()); 
            }

        }

        protected IEnumerable<ChartOfAccountVM> LoadChartOfAccounts()
        {

#if DEBUG
            //string URI for out of office development
           // string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpointDev;
            //for office development
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpoint;
#else
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpoint;
#endif
            var ChartOfAccounts = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<ChartOfAccountVM> result =
                JsonConvert.DeserializeObject<IEnumerable<ChartOfAccountVM>>(ChartOfAccounts, settings);
            return result;
        }

        protected IEnumerable<StaffInfoVM> LoadStaffs()
        {
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.UserEndpoint;
            var Staffs = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<StaffInfoVM> result =
                JsonConvert.DeserializeObject<IEnumerable<StaffInfoVM>>(Staffs, settings);
            return result;
        }

        public ChartOfAccount LoadChartOfAccountByacctId(string accountId)
        {
            string chartOfAcctUrl = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpoint;

            var chartofacct = RetailUnitOfWork.API.GetAsync(chartOfAcctUrl).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<ChartOfAccount> result = JsonConvert.DeserializeObject<IEnumerable<ChartOfAccount>>(chartofacct, settings);
            ChartOfAccount result2 = (ChartOfAccount)result.Where(a => a.accountId == accountId);
            return result2;
        }
#endregion

#region Detail

        [HttpGet]
        public JsonResult GetChartOfAccount()
        {
            var list = new List<SelectTwoContent>();
            var result = LoadChartOfAccounts();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.AccountName,
                    accountname = item.AccountName,
                    accountId = item.AccountID
                    
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult GetChartOfAccountDev()
        {

            var ChartOfAccounts = RetailUnitOfWork.Chart.GetAll();

            return Json(ChartOfAccounts);
        }


        [HttpGet]
        public JsonResult GetChartOfAccountforTellerUser()
        {

            var loggedUser = User.Identity.Name;

            if (User.Identity.Name == null)
            {
                loggedUser = "tayo.olawumi";

            }
            else
            {
                loggedUser = User.Identity.Name;
            }

            var tellerAccountId = RetailUnitOfWork.tellerlogin.GetAssignedUser(loggedUser).FirstOrDefault().Accountid;

            var list = new List<SelectTwoContent>();
#if DEBUG
            var result = RetailUnitOfWork.Chart.GetAll();
            foreach (var item in result)
            {
                if (tellerAccountId == item.AccountId)
                {
                    list.Add(new SelectTwoContent
                    {
                        Id = item.Id.ToString(),
                        Text = item.AccountName,
                        accountname = item.AccountName,
                        accountId = item.AccountId

                    });
                }
            }
#else
            var result = LoadChartOfAccounts();
            foreach (var item in result)
            {
                if (tellerAccountId == item.AccountID)
                {
                    list.Add(new SelectTwoContent
                    {
                        Id = item.Id.ToString(),
                        Text = item.AccountName,
                        accountname = item.AccountName,
                        accountId = item.AccountID

                    });
                }
            }
#endif

            return Json(list);
        }

        [HttpGet]
        public JsonResult GetStaffInfo()
        {
            var list = new List<SelectTwoContent>();
            var result = LoadStaffs();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.StaffName
                });
            }
            return Json(list);
        }



        [HttpGet]
        public JsonResult listTillmapping()
        {
            var result = RetailUnitOfWork.tillMapping.GetDetails();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listTellerLogout()
        {
            var result = RetailUnitOfWork.tellerlogin.GetNotActive();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listTellerLogin()
        {
            var result = RetailUnitOfWork.tellerlogin.GetActive();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listTellerLimit()
        {
            var result = RetailUnitOfWork.tellerLimit.GetDetailed();
            return Json(result);
        }
        
        [HttpGet]
        public JsonResult listTillLimit()
        {
            var result = RetailUnitOfWork.tillLimit.GetDetailed();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listTellerSetup()
        {
            var result = RetailUnitOfWork.tellerSetup.GetAllTellerSetup();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listTillDefinition()
        {
            var result = RetailUnitOfWork.tillDefinition.GetDetailed();
            return Json(result);
        }

        [HttpGet]
        public JsonResult listStaffInformation()
        {
            var result = RetailUnitOfWork.StaffInformation.GetAll();
            return Json(result);
        }

        [HttpGet]
        public JsonResult confirmTellerUser(int id)
        {
            var logUser = User.Identity.Name;
            var result = RetailUnitOfWork.tellerlogin.GetAssignedUserById(id);
            // RetailUnitOfWork.Commit();
            //return Json(logUser);

            var tellerLoginDetails = result.FirstOrDefault();

            //if (User.Identity.Name == null)
                if (logUser == null)
                {
                logUser = "tayo.olawumi";
                if (tellerLoginDetails.Username == logUser)
                {
                    tellerLoginDetails.Isactive = true;
                    RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
                    RetailUnitOfWork.Commit();
                    ViewData["ShowPostingMenu"] = "Valid";
                    return Json(true);

                }
                else
                {
                    return Json(false);
                }
            }
            else
            {
                //if (User.Identity.Name == tellerLoginDetails.Username)
                    if (tellerLoginDetails.Username == logUser)
                    {
                    tellerLoginDetails.Isactive = true;
                    RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
                    RetailUnitOfWork.Commit();
                    ViewData["ShowPostingMenu"] = "Valid";
                    return Json(true);

                }
                else
                {
                    return Json(false);
                }
            }

            /*tellerLoginDetails.Isactive = true;
            RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
            RetailUnitOfWork.Commit();
            return Json(true);*/
        }

        [HttpGet]
        public JsonResult updateTellerUserLogout(int id)
        {
           // System.Threading.Thread.Sleep(200);
            var logUser = User.Identity.Name;
            var result = RetailUnitOfWork.tellerlogin.GetActiveUserById(id);
            // RetailUnitOfWork.Commit();

            var tellerLoginDetails = result.FirstOrDefault();

            //if (User.Identity.Name == null)
            if (logUser == null)
            {
                logUser = "tayo.olawumi";
                if (tellerLoginDetails.Username == logUser)
                {
                    tellerLoginDetails.Isactive = false;
                    RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
                    RetailUnitOfWork.Commit();
                    ViewData["ShowPostingMenu"] = "invalid";
                    return Json(true);

                }
                else
                {
                    return Json(false);
                }
            }
            else
            {
                //if (User.Identity.Name == tellerLoginDetails.Username)
                if (logUser == tellerLoginDetails.Username)
                {
                    tellerLoginDetails.Isactive = false;
                    RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
                    RetailUnitOfWork.Commit();
                    ViewData["ShowPostingMenu"] = "invalid";
                    return Json(true);

                }
                else
                {
                    return Json(false);
                }
            }

            /*tellerLoginDetails.Isactive = true;
            RetailUnitOfWork.tellerlogin.Update(tellerLoginDetails);
            RetailUnitOfWork.Commit();
            return Json(true);*/
        }

        [HttpGet]
        public JsonResult getAllSingleTransfer()
        {
            var logUser = User.Identity.Name;
            if (logUser == null)
            {
                logUser = "tayo.olawumi";
            }
            var tellerTransactions = RetailUnitOfWork.Transaction.tellerTransactions(logUser);

             return Json(tellerTransactions);
        }

#endregion

            #region Create

        [HttpPost]
        public JsonResult AddTillMap(TblTillmapping mapping)
        {
            DateTime time = DateTime.Now;             // Use current time.
            string format = "dd/MMM/yyyy";   // Use this format.
            string chargeDate = time.ToString(format);
            mapping.Datecreated = Convert.ToDateTime(chargeDate);

            mapping.Createdby = User.Identity.Name;
            //mapping.Createdby = "Peter.Sunday";
            
            var definitionName = RetailUnitOfWork.tillDefinition.GetAll()
                .Where(p => p.Id == mapping.Tilldefinationid)
                .FirstOrDefault().Tellername;
            mapping.Tilldefinationname = definitionName;

            var ledgerAccount = LoadChartOfAccounts()
                .Where(p => p.Id == mapping.Chartofaccountid)
                .FirstOrDefault().AccountID;
            mapping.Accountid = ledgerAccount;


            RetailUnitOfWork.tillMapping.Add(mapping);
            RetailUnitOfWork.Commit();
            return Json(mapping.Id);

        }

        [HttpPost]
        public JsonResult AddTillDefinition(TblTilldefinition definition)
        {
            DateTime time = DateTime.Now;             // Use current time.
            string format = "dd/MMM/yyyy";   // Use this format.
            string chargeDate = time.ToString(format);
            definition.Datecreated = Convert.ToDateTime(chargeDate);

            definition.Createdby = "Peter";          
                      
             RetailUnitOfWork.tillDefinition.Add(definition);
             RetailUnitOfWork.Commit();
             return Json(definition.Id);         
        }

        [HttpPost]
        public JsonResult AddTillLimit([FromBody]TblTillimit Till)      
        {
            Till.Datecreated = DateTime.Now;
            Till.Createdby = "Peter";
            Till.Branchid = 3;
            Till.Companyid = 1;

            if (Till.Ledgeraccount == null || Till.Tillfunction == null || Till.Tillname == null)
            {
                var ledgerAcct = RetailUnitOfWork.tillMapping.GetDetails().Where(p => p.Id == Till.Tillmappingid).FirstOrDefault().Accountid;
                Till.Ledgeraccount = ledgerAcct;

                var tillFunct = RetailUnitOfWork.tillFunction.GetAll().Where(p => p.Id == Till.Tillfunctionid).FirstOrDefault().Tillfunction;
                Till.Tillfunction = tillFunct;

                var tillName = RetailUnitOfWork.tillMapping.GetDetails().Where(p => p.Id == Till.Tillmappingid).FirstOrDefault().Tilldefinationname;
                Till.Tillname = tillName;
            }
                  
            RetailUnitOfWork.tillLimit.Add(Till);
            RetailUnitOfWork.Commit();

            return Json(Till.Id);
        }
        
        public JsonResult AddTellerLimit([FromBody]TblTellerlimit teller)        
        {         
            TblOperationtype type = new TblOperationtype();  
            var operationName = RetailUnitOfWork.operationType.GetDetailed().Where(P => P.Id == teller.Operationtypeid).FirstOrDefault().Operationname;
            teller.Operationname = operationName;

            teller.Companyid = 1;
            teller.Branchid = 1;
            
            RetailUnitOfWork.tellerLimit.Add(teller);
            RetailUnitOfWork.Commit();
            return Json(teller.Id);
        }

        [HttpPost]
        public JsonResult AddTellerSetup(TblTellersetup Setteller)       
        {
            Setteller.Companyid = 1;
            Setteller.Branchid = 1;
            Setteller.Datecreated = DateTime.Now;
            //Setteller.Createdby = "peter";
            Setteller.Createdby = User.Identity.Name;

            var tillName = RetailUnitOfWork.tillLimit.GetAll().Where(p => p.Id == Setteller.Tilllimitid).FirstOrDefault().Tillname;
            Setteller.Tillname = tillName;

            var tillUser = LoadStaffs()
                .Where(p => p.Id == Setteller.Staffinformationid.ToString())
                .FirstOrDefault().StaffName;
            Setteller.Tilluser = tillUser;

            var tillLedger = RetailUnitOfWork.tillLimit.GetDetailed().Where(p => p.Id == Setteller.Tilllimitid).FirstOrDefault().Ledgeraccount;
            Setteller.Tillaccountnumber = tillLedger;
                   

            var tillLedgerName = RetailUnitOfWork.tillLimit.GetDetailed().Where(p => p.Id == Setteller.Tilllimitid).FirstOrDefault().Tillname;
            Setteller.Tillaccountnumber = tillLedger;

            var LoginCounter = RetailUnitOfWork.tellerlogin.GetAll().Where(t => t.Accountid == Setteller.Tillaccountnumber).Count();

            if (LoginCounter == 0)
            {
                TblTellerlogin loginteller = new TblTellerlogin();
                loginteller.Accountid = tillLedger.ToString();
                loginteller.Ledgername = tillLedgerName;
                loginteller.Username = tillUser;
             
                RetailUnitOfWork.tellerlogin.Add(loginteller);

            }
            
            RetailUnitOfWork.tellerSetup.Add(Setteller);
            RetailUnitOfWork.Commit();
            return Json(Setteller.Id);
        }

        //public JsonResult AddTransactionOperation(TblBankingsinglefundtransfer singlefund)  TblFinanceTransaction
        public JsonResult AddTransactionOperation(TblFinanceTransaction singlefund)
        {
            //var loginUsers = RetailUnitOfWork.TransactionOperations.Find(o => o.StaffName == User.Identity.Name);
            //var loginUsers = "Fagbemi Babatunde";
            var logUser = User.Identity.Name;
            if (logUser == null)
            {
                logUser = "tayo.olawumi";
            }

            
            singlefund.PostingTime = DateTime.Now.ToShortTimeString();
            //singlefund.CoyCode = "101";
            //singlefund.BrCode = "1";
            //singlefund.ApprovedBy = logUser;
            singlefund.ValueDate = DateTime.Now;
            //singlefund.TransactionDate = DateTime.Now;
            singlefund.TransactionType = 1;
            singlefund.PostedBy = logUser;
            singlefund.Approved = false;
            Random r = new Random();
            int rInt = r.Next(0, 5000);
            singlefund.Ref = "GLP/" + DateTime.Now.Year + "/" + rInt.ToString();


            //RetailUnitOfWork.SingleFundTransfer.Add(singlefund);
            RetailUnitOfWork.Transaction.Add(singlefund);
            RetailUnitOfWork.Commit();            
            //bool result = RetailUnitOfWork.TransactionOperations.SingleFundTransfer(singlefund.AccountDr, singlefund.AccountCr, singlefund.Amount, singlefund.NarrationCr, singlefund.ChequeNo);

            return Json(singlefund.Id);
        }


        public JsonResult AddLodgement(TblFinanceTransaction transactions)
        {
            transactions.ValueDate = DateTime.Now;
            transactions.PostedBy = "sys";
            transactions.PostingTime = DateTime.Now.ToShortTimeString();
            transactions.Ref = "TRN/201/0020655";
            transactions.SCoyCode = "101";


            RetailUnitOfWork.Transaction.Add(transactions);

            TblFinanceCounterpartyTransaction counterParty = new TblFinanceCounterpartyTransaction();

            //var user = User.Identity.Name;
            var user = "Peter";

            counterParty.TransactionDate = DateTime.Now;
            counterParty.UserName = user;
            counterParty.Coy = "1";
            counterParty.PostDate = DateTime.Now.Date;
            counterParty.SystemDateTime = DateTime.Now;
            counterParty.BatchRef = "TRN/201/0020655";

            RetailUnitOfWork.FinCounterParty.Add(counterParty);


            RetailUnitOfWork.Commit();
            return Json(transactions.Id);
        }


        public JsonResult AddVaultToTill(TblFinanceTransaction vaulttoTill)
        {
            //var loginUsers = RetailUnitOfWork.Transaction.Find(o => o.StaffName == User.Identity.Name);
            var user = "sys";               //@TODO, Change to login user later
            vaulttoTill.TransactionDate = DateTime.Now;
            vaulttoTill.ValueDate = DateTime.Now;
            vaulttoTill.PostedBy = "sys";
            vaulttoTill.PostingTime = DateTime.Now.ToShortTimeString();
            vaulttoTill.SCoyCode = "101";
            vaulttoTill.ApprovedBy = user;
            vaulttoTill.SourceBranch = user;
            vaulttoTill.DestinationBranch = "201";
            vaulttoTill.BatchRef = "TRN/201/0020655";
            vaulttoTill.ApplicationId = "FintrakBanking";         

            RetailUnitOfWork.Transaction.Add(vaulttoTill);            
            RetailUnitOfWork.Commit();
            return Json(vaulttoTill.Id);
        }


        [HttpGet]
        public JsonResult loadGLBalance(string AccountID)
        {
            //var chart = RetailUnitOfWork.Chart.GetAll().Where(o => o.AccountName == AccountID).OrderByDescending(o => o.DateCreated).FirstOrDefault();
            var chart = RetailUnitOfWork.Chart.GetAll().Where(o => o.AccountId == AccountID).FirstOrDefault();
            decimal balance = RetailUnitOfWork.Transaction.SPGLBalance(chart.AccountId);
            var reply = RetailUnitOfWork.Transaction.GetAll().Where(o => o.AccountId == chart.AccountId).OrderByDescending(o => o.Id).FirstOrDefault();

            return Json(balance);
        }



        protected IEnumerable<ChartOfAccountVM> LoadChartOfAccounts2()
        {
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpoint;
            var ChartOfAccounts = RetailUnitOfWork.API.GetAsync(Uri).Result;
            //var ChartOfAccounts = RetailUnitOfWork.Chart.GetAll();
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<ChartOfAccountVM> result =
                JsonConvert.DeserializeObject<IEnumerable<ChartOfAccountVM>>(ChartOfAccounts, settings);
            return result;
        }


        [HttpGet]
        public JsonResult GetChartOfAccount2()
        {
            var list = new List<SelectTwoContent>();
            var result = LoadChartOfAccounts2().Where(i => i.AccountID == "100010000");
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.AccountName,
                    accountname = item.AccountName,
                    accountId = item.AccountID

                });
            }
            return Json(list);
        }

       

        [HttpGet]
        public JsonResult loadVaultTillBalance(string accountId)
        {
            var chart1 = RetailUnitOfWork.Chart.GetAll().Where(a => a.AccountId == accountId).Single();
            decimal balance1 = RetailUnitOfWork.Transaction.SPGLBalance(chart1.AccountId);
            var reply1 = RetailUnitOfWork.Transaction.GetAll().Where(a => a.AccountId == chart1.AccountId).OrderByDescending(a => a.Id).FirstOrDefault();

            return Json(balance1);
        }



        //public JsonResult AddSingleChequeOperation()
        //{
        //    RetailUnitOfWork.SingleCheque.Add();
        //    RetailUnitOfWork.Commit();
        //    return Json();
        //}

        //public JsonResult AddMultipleChequeOperation()
        //{
        //    RetailUnitOfWork.MultipleCheque.Add();
        //    RetailUnitOfWork.Commit();
        //    return Json();
        //}

        //public JsonResult AddChequeUploadOperation()
        //{
        //    RetailUnitOfWork.ChequeUpload.Add();
        //    RetailUnitOfWork.Commit();
        //    return Json();
        //}

        public JsonResult AddChequeWithdrawal(TblFinanceTransaction withdrawal)
        {
            withdrawal.ValueDate = DateTime.Now;
            withdrawal.PostedBy = "sys";
            withdrawal.PostingTime = DateTime.Now.ToShortTimeString();
            withdrawal.Ref = "TRN/201/0020654";
            withdrawal.TransactionDate = DateTime.Now;
            withdrawal.SCoyCode = "101";



            RetailUnitOfWork.Transaction.Add(withdrawal);

            TblFinanceCounterpartyTransaction withdrawCountParty = new TblFinanceCounterpartyTransaction();

            //var user = User.Identity.Name;
            var user = "Peter";

            withdrawCountParty.TransactionDate = DateTime.Now;
            withdrawCountParty.UserName = user;
            withdrawCountParty.Coy = "1";
            withdrawCountParty.PostDate = DateTime.Now.Date;
            withdrawCountParty.SystemDateTime = DateTime.Now;
            withdrawCountParty.BatchRef = "TRN/201/0020654";

            RetailUnitOfWork.FinCounterParty.Add(withdrawCountParty);


            RetailUnitOfWork.Commit();
            return Json(withdrawal.Id);


        }



#region SecurityImageDocument
        public JsonResult AddExcelChequeUpload(UploadFiles upload)
        {
            using (var db = new TheCoreBanking_FilesContext())
            //using (var stream = new MemoryStream())
            {
                for (int imgCounter = 0; imgCounter < upload.ImageFile.Count; imgCounter++)
                {
                    TblLodgementWithdrawal imagedocument = new TblLodgementWithdrawal
                    {
                        AccountId = upload.AccountId,
                        Description = upload.FileTitle,
                        Mime = upload.ImageFile[imgCounter].ContentType,
                        IsDeleted = false
                    };

                    using (var stream = new MemoryStream())
                    {
                        upload.ImageFile[imgCounter].CopyTo(stream);
                        imagedocument.FileData = stream.ToArray();
                    }
                    db.TblLodgementWithdrawal.Add(imagedocument);
                }

                db.SaveChanges();
            }
            return Json(true);
        }
#endregion


#endregion

#region Update

        [HttpPost]
        public JsonResult updateTillMap(TblTillmapping mapping)
        {
            mapping.Updatedby = "Joseph.Umoh";
            mapping.Dateupdated = DateTime.Now;

            var definitionName = RetailUnitOfWork.tillDefinition.GetAll().Where(p => p.Id == mapping.Tilldefinationid).FirstOrDefault().Tellername;
            mapping.Tilldefinationname = definitionName;

            var ledgerAccount = LoadChartOfAccounts()
                .Where(p => p.Id == mapping.Chartofaccountid)
                .FirstOrDefault().AccountID;
            mapping.Accountid = ledgerAccount;

            RetailUnitOfWork.tillMapping.Update(mapping);
            RetailUnitOfWork.Commit();
            return Json(mapping.Id);
        }

        [HttpPost]
        public JsonResult updateTillDefinition(TblTilldefinition definition)
        {
            definition.Dateupdated = DateTime.Now;
            definition.Updatedby = "Okereke";

            RetailUnitOfWork.tillDefinition.Update(definition);
            RetailUnitOfWork.Commit();
            return Json(definition.Id);
        }

        public JsonResult getTellerLogin(TblTellerlogin loginteller)
        {
            // loginteller.Tellerlogintime 
            loginteller.Tellerlogindate = DateTime.Now;
            loginteller.Branchid = "1";
            loginteller.Companyid = "1";
            loginteller.Username = "tayo.olawumi";
            loginteller.Isactive = true;
            loginteller.Closingbalance = 100 + 200;
            loginteller.Accountbalance = Math.Abs(200 + 100);

            RetailUnitOfWork.tellerlogin.Update(loginteller);
            RetailUnitOfWork.Commit();
            return Json(loginteller.Id);
        }

        public JsonResult updateTellerLimit(TblTellerlimit teller)
        {            
            var operationName = RetailUnitOfWork.operationType.GetDetailed().Where(P => P.Id == teller.Operationtypeid).FirstOrDefault().Operationname;
            teller.Operationname = operationName;

            RetailUnitOfWork.tellerLimit.Update(teller);
            RetailUnitOfWork.Commit();
            return Json(teller.Id);
        }

        public JsonResult updateTillLimit(TblTillimit Till)
        {
            var ledgerAcct = RetailUnitOfWork.tillMapping.GetAll().Where(p => p.Id == Till.Tillmappingid).FirstOrDefault().Accountid;
            Till.Ledgeraccount = ledgerAcct;

            var tillFunct = RetailUnitOfWork.tillFunction.GetAll().Where(p => p.Id == Till.Tillfunctionid).FirstOrDefault().Tillfunction;
            Till.Tillfunction = tillFunct;

            var tillName = RetailUnitOfWork.tillMapping.GetAll().Where(p => p.Id == Till.Tillmappingid).FirstOrDefault().Tilldefinationname;
            Till.Tillname = tillName;

            RetailUnitOfWork.tillLimit.Update(Till);
            RetailUnitOfWork.Commit();
            return Json(Till.Id);
        }

        public JsonResult updateTellerSetup(TblTellersetup Setteller)
        {
            var tillUser = LoadStaffs()
                .Where(p => p.Id == Setteller.Staffinformationid.ToString())
                .FirstOrDefault().StaffName;
            Setteller.Tilluser = tillUser;

            //var tillAccountnumber = RetailUnitOfWork.tillMapping.GetAll().Where(p => p.Id == Setteller.Tillmappingid).FirstOrDefault().Accountid;
            //Setteller.Tillaccountnumber = tillAccountnumber;

            var tillLedger = RetailUnitOfWork.tillLimit.GetDetailed().Where(p => p.Id == Setteller.Tilllimitid).FirstOrDefault().Ledgeraccount;
            Setteller.Tillaccountnumber = tillLedger;
                    
            var tillName = RetailUnitOfWork.tillLimit.GetAll().Where(p => p.Id == Setteller.Tilllimitid).FirstOrDefault().Tillname;
            Setteller.Tillname = tillName;
                             
            RetailUnitOfWork.tellerSetup.Update(Setteller);
            RetailUnitOfWork.Commit();
            return Json(Setteller.Id);
        }

#endregion

#region Delete

        public JsonResult DeleteTellerLimit(TblTellerlimit teller)
        {
            var item = RetailUnitOfWork.tellerLimit.GetById(teller.Id);
            item.Isdelete = true;
            
            RetailUnitOfWork.tellerLimit.Update(item);
            RetailUnitOfWork.Commit();
            return Json(teller.Id);
        }

        public JsonResult DeleteTillLimit(TblTillimit Till)
        {
            var item = RetailUnitOfWork.tillLimit.GetById(Till.Id);
            item.Isdeleted = true;

            RetailUnitOfWork.tillLimit.Update(item);
            RetailUnitOfWork.Commit();
            return Json(Till.Id);
        }

        public JsonResult DeleteTellerSetup(TblTellersetup Setteller)
        {
            var item = RetailUnitOfWork.tellerSetup.GetById(Setteller.Id);
            item.Isdelete = true;

            RetailUnitOfWork.tellerSetup.Update(item);
            RetailUnitOfWork.Commit();
            return Json(Setteller.Id);

        }

        public JsonResult LogoutTellerLogin(TblTellerlogin loginTeller)
        {
            var item = RetailUnitOfWork.tellerlogin.GetById(loginTeller.Id);
            item.Isactive = false;

            RetailUnitOfWork.tellerlogin.Update(item);
            RetailUnitOfWork.Commit();
            return Json(loginTeller.Id);
        }

        public JsonResult DeleteTillMapping(TblTillmapping mapping)
        {
            var item = RetailUnitOfWork.tillMapping.GetMapId(mapping.Id);
            item.Isdeleted = true;

            RetailUnitOfWork.tillMapping.Update(item);
            RetailUnitOfWork.Commit();
            return Json(mapping.Id);
        }

        public JsonResult DeleteTillDefinition(TblTilldefinition definition)
        {
            var item = RetailUnitOfWork.tillDefinition.GetActive(definition.Id);
            item.Isdeleted = true;

            RetailUnitOfWork.tillDefinition.Update(item);
            RetailUnitOfWork.Commit();
            return Json(definition.Id);
        }

#endregion


#region

        // utilities
        private Dictionary<string, string>.KeyCollection GetApiData(string UriSuffix)
        {
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            string Uri = ApiConstants.BaseApiUrl + UriSuffix;

            return JsonConvert.DeserializeObject<IEnumerable<SelectTwoContent>>
                (
                    RetailUnitOfWork.API.GetAsync(Uri).Result,
                    settings
                ).ToDictionary(x => x.Id, x => x.Text).Keys;
        }
#endregion

#region Select2 Helper

        public class Select2Format
        {
            public List<SelectContent> results { get; set; }
        }
        public class SelectContent
        {
            public string id { get; set; }
            public string text { get; set; }

            public string accountname { get; set; }
            public string accountId { get; set; }
            public decimal availablebalance { get; set; }
        }
#endregion

    }
}
