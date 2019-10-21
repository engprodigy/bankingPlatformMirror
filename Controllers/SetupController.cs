using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TheCoreBanking.Retail.Data.Contracts;
using TheCoreBanking.Retail.Data.Helpers;
using TheCoreBanking.Retail.Data.Models;
using TheCoreBanking.Retail.ViewModels;

namespace TheCoreBanking.Retail.Controllers
{
    public class SetupController : Controller
    {
        private IRetailUnitOfWork RetailUnitOfWork { get; }
        public SetupController(IRetailUnitOfWork retailUnitOfWork)
        {
            RetailUnitOfWork = retailUnitOfWork;
        }

        [Authorize]
        public IActionResult Index()
        {
            return View();
        }

        #region Create

        [HttpPost]
        public JsonResult AddChequeBook([FromBody]TblChequebooktype chequetype)
        {
            RetailUnitOfWork.ChequeTypes.Add(chequetype);
            RetailUnitOfWork.Commit();
            return Json(chequetype.Id);
        }

        [HttpPost]
        public JsonResult AddTellerCloseLimit([FromBody]TblTellercloselimitsetup tellerSetup)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    RetailUnitOfWork.tellerCloseLimitSetup.Add(tellerSetup);
                    RetailUnitOfWork.Commit();
                }
                return Json(tellerSetup.Tellercloselimitid);

            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }

        }

        [HttpPost]
        public JsonResult AddSystemNarration([FromBody]DBNull nuill)
        {
            return null;
        }

        [HttpPost]
        public JsonResult AddRetailOperationType([FromBody]TblRetailoperationtype operationType)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    RetailUnitOfWork.retailOperation.Add(operationType);
                    RetailUnitOfWork.Commit();
                }
                return Json(operationType.Retailoperationid);

            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpPost]
        public JsonResult AddTillLimitSetup([FromBody]TblTilllimitsetup tillSetup)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    RetailUnitOfWork.tillLimitSetup.Add(tillSetup);
                    RetailUnitOfWork.Commit();
                }
                return Json(tillSetup.Tillid);
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpPost]
        public JsonResult AddBankDraft(TblBankdraftsetup draftbank)
        {
            draftbank.Datetimecreated = DateTime.Now;
            draftbank.Companyid = 1;
            draftbank.Sourcebranchid = 101;
            draftbank.Destinationbranchid = 101;
            draftbank.Createdby = "sys";
            RetailUnitOfWork.bankdraftSetup.Add(draftbank);
            RetailUnitOfWork.Commit();
            return Json(draftbank.Bankdraftid);
        }

        [HttpPost]
        public JsonResult AddReversalG(TblGrantreversalprivilege reversal)
        {

            //reversal.Username = result.
            reversal.Companyid = 1;
            reversal.Branchid = 101;
            reversal.Createdby = "peter";

            reversal.Datetimecreated = DateTime.Now;

            RetailUnitOfWork.grantreversal.Add(reversal);
            RetailUnitOfWork.Commit();
            return Json(reversal.Reversalsetupid);
        }

        [HttpPost]
        public JsonResult AddTransferCharges([FromBody]TblTransfercharge charge)
        {
            charge.Companyid = 1;
            charge.Branchid = 101;
            charge.Createdby = "peter";
            charge.Datetimecreated = DateTime.Now;

            RetailUnitOfWork.transferCharges.Add(charge);
            RetailUnitOfWork.Commit();

            return Json(charge.Transferchargeid);
        }

        [HttpPost]
        public JsonResult AddCOT([FromBody]TblCotsetup COT)
        {
            var CotCount = RetailUnitOfWork.COT
                .GetAll().Count();
            if (CotCount > 0)
            {
                return Json(
                    new string[2] {
                        "error",
                        "An entry already exists for COT and only one is permitted. Please edit that instead."
                    }
                );
            }

            // Save after passing validations
            COT.DateCreated = DateTime.Now;
            RetailUnitOfWork.COT.Add(COT);
            RetailUnitOfWork.Commit();

            return Json(
                new string[2] {
                    "success",
                    COT.Id.ToString()
                }
            );
        }

        [HttpPost]
        public JsonResult AddStampDuty([FromBody]TblStampcharge StampDuty)
        {
            var RowCount = RetailUnitOfWork.StampDuty
                .GetAll().Count();
            if (RowCount > 0)
            {
                return Json(
                    new string[2] {
                        "error",
                        "An entry already exists for Stamp Duty charge and only one is permitted. Please edit that instead."
                    }
                );
            }

            // Save after passing validations
            StampDuty.Datecreated = DateTime.Now;
            RetailUnitOfWork.StampDuty.Add(StampDuty);
            RetailUnitOfWork.Commit();

            return Json(
                new string[2] {
                    "success",
                    StampDuty.Id.ToString()
                }
            );
        }

        [HttpPost]
        public JsonResult AddChequeCharge([FromBody]TblChequecharges ChequeCharge, string id)
        {
            var charges = RetailUnitOfWork.ChequeCharges.GetAll().ToList();
            switch (charges.Count)
            {
                case 0:
                    break;
                case 1:
                case 2:
                    foreach (var item in charges)
                    {
                        if (id == "return")
                        {
                            if (item.Isreturncharge)
                            {
                                return Json(
                                    new List<string> {
                                        "error",
                                        "An entry already exists for return cheque charge. Please edit that instead."
                                    }
                                );
                            }
                        }
                        else
                        {
                            if (item.Isdiscountcharge)
                            {
                                return Json(
                                    new List<string> {
                                        "error",
                                        "An entry already exists for discount cheque charge. Please edit that instead."
                                    }
                                );
                            }
                        }
                    }
                    break;
                default:
                    return Json(new List<string> {
                                    "error",
                                    "Entries already exists for return and discount cheque charge. Please edit that instead."
                                });
            }

            // Save after passing validations
            if (id == "return")
            {
                ChequeCharge.Isdiscountcharge = false;
                ChequeCharge.Isreturncharge = true;
            }
            else
            {
                ChequeCharge.Isdiscountcharge = true;
                ChequeCharge.Isreturncharge = false;
            }
            ChequeCharge.Datecreated = DateTime.Now;
            RetailUnitOfWork.ChequeCharges.Add(ChequeCharge);
            RetailUnitOfWork.Commit();

            return Json(new List<string> { "error", null });
        }

        #endregion

        #region Fetch

        [HttpGet]
        public JsonResult LoadChequeTypes()
        {
            var result = RetailUnitOfWork.ChequeTypes.GetAll();
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadSystemNarrations()
        {
            return null;
        }

        [HttpGet]
        public JsonResult LoadStampDuty()
        {
            //var result = RetailUnitOfWork.StampDuty.GetAll();
            var result = RetailUnitOfWork.StampDuty.GetDetailed();
            return Json(result);
        }

        [HttpGet]
        public JsonResult ListGrantReversal()
        {
            var result = RetailUnitOfWork.grantreversal.GetActive();
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadChartOfAccount()
        {
            var list = new List<SelectTwoContent>();
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChartOfAccountEndpoint;
            var ChartOfAccounts = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<ChartOfAccountVM> result =
                JsonConvert.DeserializeObject<IEnumerable<ChartOfAccountVM>>(ChartOfAccounts, settings);
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.AccountName
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult ListBankDraftSetup()
        {
            var result = RetailUnitOfWork.bankdraftSetup.GetDetailed();
            return Json(result);
        }

        [HttpGet]
        public JsonResult ListTransferCharges()
        {
            var result = RetailUnitOfWork.transferCharges.GetActive();
            return Json(result);
        }
        
        [HttpGet]
        public JsonResult ListChequeBookTypes()
        {
            var list = new List<SelectTwoContent>();
            var result = RetailUnitOfWork.ChequeTypes.GetActive();
            foreach (var item in result)
            {
                list.Add(new SelectTwoContent
                {
                    Id = item.Id.ToString(),
                    Text = item.Chequetype
                });
            }
            return Json(list);
        }

        [HttpGet]
        public JsonResult ListStaffs()
        {
            var list = new List<SelectTwoContent>();
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.UserEndpoint;
            var Staffs = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<StaffInfoVM> result =
                JsonConvert.DeserializeObject<IEnumerable<StaffInfoVM>>(Staffs, settings);
            foreach (var item in result)
            {
                list.Add(
                    new SelectTwoContent {
                        Id = item.Id,
                        Text = item.StaffName
                    }
                );
            }
            return Json(list);
        }


        [HttpGet]
        public JsonResult GetAllRetailOperation()
        {
            try
            {
                return Json(RetailUnitOfWork.retailOperation.GetAll());
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult GetRetailOperationById(int id)
        {
            try
            {
                return Json(RetailUnitOfWork.retailOperation.GetById(id));
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult GetAllTellerCloseLimit()
        {
            try
            {
                return Json(RetailUnitOfWork.tellerCloseLimitSetup.GetAll());
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult GetTellerCloseLimitById(int id)
        {
            try
            {
                return Json(RetailUnitOfWork.tellerCloseLimitSetup.GetById(id));
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult GetAllTillLimitSetup()
        {
            try
            {
                return Json(RetailUnitOfWork.tillLimitSetup.GetAll());
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult GetTillLimitSetupById(int id)
        {
            try
            {
                return Json(RetailUnitOfWork.tillLimitSetup.GetById(id));
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        [HttpGet]
        public JsonResult LoadChequeCharges()
        {
            var result = RetailUnitOfWork.ChequeCharges.GetAll();
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadCOT()
        {
            var result = RetailUnitOfWork.COT.GetActive();
            return Json(result);
        }

        /* public JsonResult LoadCustomerAccountTypes()
         {
             var list = new List<SelectTwoContent>();
             var result =   LoadChartOfAccount();
             foreach (var item in result)
             {
                 list.Add(new SelectTwoContent
                 {
                     Id = item.Id.ToString(),
                     Text = item.Name
                 });
             }
             return Json(list);
         }*/

        #endregion

        #region Update

        [HttpPost]
        public JsonResult UpdateChequeBook([FromBody] TblChequebooktype chequetype)
        {
            RetailUnitOfWork.ChequeTypes.Update(chequetype);
            RetailUnitOfWork.Commit();
            return Json(chequetype.Id);
        }

        [HttpPost]
        public JsonResult UpdateSystemNarration([FromBody]DBNull nuill)
        {
            return null;
        }

        public JsonResult UpdateBankDraft(TblBankdraftsetup draftsetup)
        {
            draftsetup.Datetimeupdated = DateTime.Now;

            draftsetup.Lastupdatedby = "Solomon";          
            draftsetup.Companyid = 1;
            draftsetup.Sourcebranchid = 101;
            draftsetup.Destinationbranchid = 101;
            draftsetup.Createdby = "peter";

            RetailUnitOfWork.bankdraftSetup.Update(draftsetup);
            RetailUnitOfWork.Commit();
            return Json(draftsetup.Bankdraftid);
        }

        public JsonResult UpdateTransferCharges(TblTransfercharge charge)
        {
            RetailUnitOfWork.transferCharges.Update(charge);
            RetailUnitOfWork.Commit();
            return Json(charge.Transferchargeid);
        }

        public JsonResult UpdateReversalPrivilege(TblGrantreversalprivilege reversal)
        {
            reversal.Datetimecreated = DateTime.Now;

            RetailUnitOfWork.grantreversal.Update(reversal);
            RetailUnitOfWork.Commit();
            return Json(reversal.Reversalsetupid);
        }

        [HttpPost]
        public JsonResult UpdateChequeCharge([FromBody] TblChequecharges ChequeCharge)
        {
            ChequeCharge.Dateupdated = DateTime.Now;
            RetailUnitOfWork.ChequeCharges.Update(ChequeCharge);
            RetailUnitOfWork.Commit();
            return Json(ChequeCharge.Id);
        }

        [HttpPost]
        public JsonResult UpdateCOT([FromBody] TblCotsetup COT)
        {
            RetailUnitOfWork.COT.Update(COT);
            RetailUnitOfWork.Commit();
            return Json(COT.Id);
        }

        [HttpPost]
        public JsonResult UpdateStampDuty([FromBody]TblStampcharge StampDuty)
        {
            RetailUnitOfWork.StampDuty.Update(StampDuty);
            RetailUnitOfWork.Commit();
            return Json(StampDuty.Id);
        }

        #endregion

        #region Delete

        [HttpPost]
        public JsonResult DeleteChequeBook([FromBody] TblChequebooktype chequetype)
        {
            RetailUnitOfWork.ChequeTypes.Delete(chequetype.Id);
            RetailUnitOfWork.Commit();
            return Json(true);
        }

        [HttpPost]
        public JsonResult DeleteSystemNarration([FromBody]DBNull nuill)
        {
            return null;
        }

        [HttpPost]
        public JsonResult DeleteChequeCharge(int id)
        {
            RetailUnitOfWork.ChequeCharges.Delete(id);
            RetailUnitOfWork.Commit();
            return Json(true);
        }

        [HttpPost]
        public JsonResult DeleteCOT(int id)
        {
            RetailUnitOfWork.COT.Delete(id);
            RetailUnitOfWork.Commit();
            return Json(true);
        }

        [HttpPost]
        public JsonResult DeleteStampDuty(int id) {
            RetailUnitOfWork.StampDuty.Delete(id);
            RetailUnitOfWork.Commit();
            return Json(id);
        }

        public JsonResult DeleteBankDraft(TblBankdraftsetup draftsetup)
        {
            var item = RetailUnitOfWork.bankdraftSetup.GetById(draftsetup.Bankdraftid);
            item.Isdeleted = true;
            item.Datetimedeleted = DateTime.Now;
            item.Deletedby = "Segun";

            //draftsetup.Datetimedeleted = DateTime.Now;

            RetailUnitOfWork.bankdraftSetup.Update(item);
            RetailUnitOfWork.Commit();
            return Json(draftsetup.Bankdraftid);
        }

        public JsonResult DeleteTransferCharges(TblTransfercharge charge)
        {
            var item = RetailUnitOfWork.transferCharges.GetById(charge.Transferchargeid);
            item.Deleted = true;
            item.Datetimedeleted = DateTime.Now;
            item.Deletedby = "Segun";           

            RetailUnitOfWork.transferCharges.Update(item);
            RetailUnitOfWork.Commit();
            return Json(charge.Transferchargeid);
        }

        public IActionResult DeleteReversalPrivilege(TblGrantreversalprivilege reversalprivilege)
        {
            var item = RetailUnitOfWork.grantreversal.GetById(reversalprivilege.Reversalsetupid);
            item.Isdeleted = true;
            item.Datetimedeleted = DateTime.Now;
            item.Deletedby = "Segun";
            //item.Staffinformationid = item.Staffinformation.Id;
         
            RetailUnitOfWork.grantreversal.Update(item);
            RetailUnitOfWork.Commit();
            return Json(reversalprivilege.Reversalsetupid);
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
        }
        #endregion

    }
}