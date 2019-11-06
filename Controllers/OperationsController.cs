using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Numerics;
using TheCoreBanking.Retail.Data.Contracts;
using TheCoreBanking.Retail.Data.Helpers;
using TheCoreBanking.Retail.Data.Models;
using TheCoreBanking.Retail.Data.Enums;
using TheCoreBanking.Retail.ViewModels;

namespace TheCoreBanking.Retail.Controllers
{
    public class OperationsController : Controller
    {
        private IRetailUnitOfWork RetailUnitOfWork { get; }
        public OperationsController(IRetailUnitOfWork retailUnitOfWork)
        {
            RetailUnitOfWork = retailUnitOfWork;
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult RegisterCheque()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult ChequeStatus()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult StopCheque()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult InwardClearing()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult OutwardClearing()
        {
            return View();
        }

#if DEBUG
        //[Authorize()]
#else
            [Authorize()]
#endif
        public IActionResult OutwardOperations()
        {
            return View();
        }

        #region Create

        [HttpPost]
        public JsonResult AddChequeRequests([FromBody]List<TblChequebookdetail> requests)
        {
            foreach (var item in requests)
            {
                item.Datecreated = DateTime.Now;
                RetailUnitOfWork.ChequeDetails.Add(item);
            }
            RetailUnitOfWork.Commit();
            return Json(true);
        }

        [HttpPost]
        public JsonResult StopCheques([FromBody]ChequeStopLeaves Leaves)
        {
            // Remove duplicate values
            var Total = Leaves.ToStop.Distinct();

            // Exclude already stopped cheque numbers
            Total = Total.Except(Leaves.Stopped);

            foreach(var Cheque in Total)
            {
                RetailUnitOfWork.ChequeLeaves.Add(
                    new TblChequeleavesdetail
                    {
                        Chequebookid = Leaves.ChequeBookId,
                        Leafno = Cheque,
                        Leafstatus = (int) ChequeLeafStatusEnum.STOPPED,
                        Datecreated = DateTime.Now
                    }    
                );
            }
            RetailUnitOfWork.Commit();
            return Json(Leaves.ChequeBookId);
        }

        [HttpPost]
        public JsonResult LodgeInwardCheque([FromBody]TblInwardbankcheque Cheque)
        {
            Cheque.Datecreated = DateTime.Now;
            // Cheque.Operationid = ;
            RetailUnitOfWork.InwardCheques.Add(Cheque);
            RetailUnitOfWork.Commit();
            return Json(Cheque.Id);
        }

        [HttpPost]
        public JsonResult LodgeOutwardCheque([FromBody]TblOutwardbankcheque Cheque)
        {
            Cheque.Datecreated = DateTime.Now;
            Cheque.Referenceno = GetRandNo(7);
            Cheque.Approvalstatus = (int)ApprovalStatusEnum.INENTRYSTATE;
            Cheque.Clearingoption = (int)ClearingOptionEnum.DEFAULT;
            Cheque.Createdby = User.Identity.Name; // accept null until server
            //Cheque.Operationid = ;
            RetailUnitOfWork.OutwardCheques.Add(Cheque);
            RetailUnitOfWork.Commit();
            return Json(Cheque.Id);
        }

        [HttpPost]
        public JsonResult LodgeBatchOutwardCheque(IFormFile ExcelFile)
        {
            JsonResult Response = null;
            var OutwardCheques = new List<TblOutwardbankcheque>();
            using (var Stream = new MemoryStream()) {
                ExcelFile.CopyTo(Stream);
                using (var package = new ExcelPackage(Stream)) {
                    var Sheet = package.Workbook.Worksheets[0];
                    int RowCount = Sheet.Dimension.Rows;
                    int ColumnCount = Sheet.Dimension.Columns;
                    decimal? StampDutyAmount = GetStampDutyAmount();
                    Dictionary<string, string>.KeyCollection AccountNumbers;
                    Dictionary<string, string>.KeyCollection BankLedgerIds;

                    if (RowCount < 2 || ColumnCount != 7) {
                        Response = Json(
                                new {
                                    success = false,
                                    responseText = "Invalid document submitted. Please use the provided template."
                                }
                            );
                    }

                    if (Response == null) {
                        // Initialize API data
                        AccountNumbers = GetApiData(ApiConstants.ChequeAccountEndpoint);
                        BankLedgerIds = GetApiData(ApiConstants.ChartOfAccountEndpoint);
                        TblOutwardbankcheque OutwardCheque;

                        // loop through worksheet
                        for (int Row = 2; Row <= RowCount; Row++) {
                            try
                            {
                                OutwardCheque = new TblOutwardbankcheque
                                {
                                    Datecreated = DateTime.Now,
                                    Referenceno = GetRandNo(7),
                                    Createdby = User.Identity.Name, // accept null until server
                                    //TODO: Operationid = ,
                                    Accountno = Sheet.Cells[Row, 1].Value.ToString(),
                                    Amount = Convert.ToDecimal(Sheet.Cells[Row, 2].Value),
                                    Chequeno = Sheet.Cells[Row, 3].Value.ToString(),
                                    Chargestampduty = Convert.ToBoolean(Sheet.Cells[Row, 4].Value),
                                    Chequedate = Convert.ToDateTime(Sheet.Cells[Row, 5].Value.ToString()),
                                    Bankledgerid = Sheet.Cells[Row, 6].Value.ToString(),
                                    Narration = Sheet.Cells[Row, 7].Value?.ToString(),
                                    Approvalstatus = (int) ApprovalStatusEnum.INENTRYSTATE,
                                    Clearingoption = (int) ClearingOptionEnum.DEFAULT
                            };
                                // Add/Remove ChargeStampDuty as appropriate
                                if (OutwardCheque.Chargestampduty)
                                {
                                    if (StampDutyAmount != null)
                                    {
                                        OutwardCheque.Chargestampamount = StampDutyAmount;
                                    } else {
                                        OutwardCheque.Chargestampduty = false;
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                if (ex is FormatException ||
                                    ex is InvalidCastException ||
                                    ex is OverflowException)
                                {
                                    Response = Json(
                                        new
                                        {
                                            success = false,
                                            responseText = "Document contains invalid data format(s). " +
                                            "Please check that the data in columns 'Cheque Value Date', " +
                                            $"'Charge Stamp Duty' and 'Amount' on row {Row} are well formatted," +
                                            " then re-submit the document."
                                        }
                                    );
                                    break;
                                } else
                                {
                                    throw;
                                } 
                            } 
                            // check validity of Account No. and Bank Ledger ID
                            if (!AccountNumbers.Contains(OutwardCheque.Accountno.Trim())) {
                                Response = Json(
                                        new
                                        {
                                            success = false,
                                            responseText = $"Record in row {Row} contains an incorrect Account Number. " +
                                            "Please correct the value and then re-submit the document. Correct values are" +
                                            " available in the dropdown inside the information section."
                                        }
                                    );
                                break;
                            }
                            if (!BankLedgerIds.Contains(OutwardCheque.Bankledgerid.Trim()))
                            {
                                Response = Json(
                                        new
                                        {
                                            success = false,
                                            responseText = $"Record in row {Row} contains incorrect Bank Ledger ID. " +
                                            "Please correct the value and then re-submit the document. Correct values are" +
                                            " available in the dropdown inside the information section."
                                        }
                                    );
                                break;
                            }
                            OutwardCheques.Add(OutwardCheque);
                        };
                    }
                }
            }
            if (Response == null)
            {
                // begin attempt to save to database
                foreach (var Cheque in OutwardCheques)
                {
                    RetailUnitOfWork.OutwardCheques.Add(Cheque);
                }
                RetailUnitOfWork.Commit();
                Response = Json(
                    new {
                        success = true,
                        responseText = "Excel upload completed successfully!"
                    }
                );
            }
            return Response;
        }

        [HttpPost]
        public JsonResult AddDocumentUpload(int id, AccompanyDocumentVM upload, bool sendall)
        {
            List<TblKycdocuments> files = null;
            using (var db = new TheCoreBanking_FilesContext())
            using (var stream = new MemoryStream())
            {
                upload.Document.CopyTo(stream);
                TblKycdocuments kycdocument = new TblKycdocuments
                {
                    Filedata = stream.ToArray(),
                    Customerid = id,
                    Title = upload.Title,
                    Mime = upload.Document.ContentType,
                    Isdeleted = false
                };
                db.TblKycdocuments.Add(kycdocument);
                db.SaveChanges();
                if (sendall)
                {
                    files = db.TblKycdocuments
                        .Where(k => k.Customerid == id)
                        .Where(k => k.Isdeleted == false)
                        .Select(k => new TblKycdocuments
                        {
                            Id = k.Id,
                            Customerid = k.Customerid,
                            Title = k.Title,
                            Mime = k.Mime
                        }).ToList();
                }
            }
            if (sendall) { return Json(files); }
            return Json(true);
        }

        #endregion

        #region Update

        public JsonResult UpdateOutwardCheque([FromBody]TblOutwardbankcheque Cheque, ClearingOptionEnum? id) {
            if (id != null)
            {
                // For outward operations
                Cheque.Clearingoption = (int)id;
            }
            else
            {
                // For outward approvals
                if (Cheque.Approvalstatus == (int)ApprovalStatusEnum.AMMEND)
                {
                    Cheque.Approvalstatus = (int)ApprovalStatusEnum.INENTRYSTATE;
                }
            }
            RetailUnitOfWork.OutwardCheques.Update(Cheque);
            RetailUnitOfWork.Commit();
            return Json(Cheque.Id);
        }

        public JsonResult ApproveOutwardCheque([FromBody]int[] ids) {
            foreach (int id in ids) {
                var Cheque = RetailUnitOfWork.OutwardCheques.GetById(id);
                Cheque.Approvalstatus = (int)ApprovalStatusEnum.PENDING;
                RetailUnitOfWork.OutwardCheques.Update(Cheque);
            }
            RetailUnitOfWork.Commit();
            return Json(true);
        }

        #endregion

        #region Delete

        public JsonResult CancelOutwardCheque(int id)
        {
            var Cheque = RetailUnitOfWork.OutwardCheques.GetById(id);
            Cheque.Approvalstatus = (int)ApprovalStatusEnum.CANCELLED;
            RetailUnitOfWork.OutwardCheques.Update(Cheque);
            RetailUnitOfWork.Commit();
            return Json(id);
        }

        [HttpPost]
        public JsonResult deleteDocumentUpload(int id)
        {
            using (var db = new TheCoreBanking_FilesContext())
            {
                db.TblKycdocuments
                    .SingleOrDefault(k => k.Id == id)
                    .Isdeleted = true;
                db.SaveChanges();
            }
            return LoadChequeAccompanyDoc(id);
        }
        #endregion

        #region Fetch

        [HttpGet]
        public JsonResult LoadChequeDetails()
        {
            var result = RetailUnitOfWork.ChequeDetails.GetDetailed();
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadAccountCheques(string id)
        {
            List<AccountCheques> result = new List<AccountCheques>();

            var Cheques = RetailUnitOfWork.ChequeDetails.GetByAccountNo(id).ToList().Where(k => k.Isexhausted == false);

            /*foreach (var Item in Cheques)
            {
                result.Add(new AccountCheques
                {
                    ID = Item.Id,
                    AccountNo = Item.Accountno,
                    Start = Item.Startrange,
                    End = Item.Endrange
                });
            }*/

            if(Cheques.Count() > 0) { 
            AccountCheques accountCheques = new AccountCheques();

            foreach (var Item in Cheques)
            {

                accountCheques.ID = Item.Id;
                accountCheques.Start = Item.Startrange;
                accountCheques.End = Item.Endrange;
                accountCheques.LeavesNo = Item.Leavesno;

            }

            var inwardChequeCount = RetailUnitOfWork.InwardCheques.GetByAccountNo(id).ToList().Where(k => k.Chequebookdetailid == accountCheques.ID
            && k.Approved == false);

            var chequeCount = inwardChequeCount.Count();

            var chequeLeaveDetailsCount = RetailUnitOfWork.ChequeLeaves.GetByChequeBookID(accountCheques.ID).ToList().Count();

            var TotalChequeCount = chequeCount + chequeLeaveDetailsCount;

            var allChequeLeaveTotal = accountCheques.LeavesNo;

            if (TotalChequeCount == allChequeLeaveTotal)
            {
                return Json(false);
            } else{

                    // return Json(Cheques);
                 return Json(true);

                }
            }

            else
            {
                return Json(false);
            }
        }

        [HttpGet]
        public JsonResult LoadAccountChequesByChequeBookTypeId(int id)
        {
            List<AccountCheques> result = new List<AccountCheques>();
            var Cheques = RetailUnitOfWork.ChequeDetails.GetByChequeId(id);
            if(Cheques.Count() > 0 )
            {
                return Json(Cheques);
            }
            else
            {

                var ChequeType = RetailUnitOfWork.ChequeTypes.GetActiveById(id);
                return Json(ChequeType);
            }
            /*foreach (var Item in Cheques)
            {
                result.Add(new AccountCheques
                {
                    ID = Item.Id,
                    AccountNo = Item.Accountno,
                    Start = Item.Startrange,
                    End = Item.Endrange
                });
            }*/
            //return Json(result);
            //return Json(Cheques);
        }

        [HttpGet]
        public JsonResult LoadDetailedAccountCheques(string id)
        {
            var result = RetailUnitOfWork.ChequeDetails.GetDetailedByAccountNo(id);
            //var result = RetailUnitOfWork.ChequeDetails.GetDetailedByAccountNo(id).ToList();
            //var newresult = result.
                
            return Json(result);
            //return Json(newresult);
        }

        [HttpGet]
        public JsonResult LoadChequeAccompanyDoc(int id)
        {
            //var result = RetailUnitOfWork.ChequeDetails.GetDetailedByAccountNo(id);
            //return Json(result);
            var testChequeNumber = id;
            List<TblKycdocuments> files = null;
            using (var db = new TheCoreBanking_FilesContext())
            {

                files = db.TblKycdocuments
                        .Where(k => k.Customerid == id)       //5004000)
                        .Where(k => k.Isdeleted == false)
                        .Select(k => new TblKycdocuments
                        {
                            Id = k.Id,
                            Customerid = k.Customerid,
                            Title = k.Title,
                            Mime = k.Mime
                        }).ToList();

            }

            return Json(files);
        }


        [HttpGet]
        public JsonResult LoadChequeLeaves(int id)
        {
            var result = RetailUnitOfWork.ChequeLeaves
                .GetByChequeBookID(id)
                .ToList();
            var response = new ChequeLeavesContainer {
                Used = result
                .Where(l => l.Leafstatus == (int) ChequeLeafStatusEnum.USED),
                Stopped = result
                .Where(l => l.Leafstatus == (int) ChequeLeafStatusEnum.STOPPED)
            };
            return Json(response);
        }

        //[HttpGet("{id}/{chequeleaveno}")]
        [HttpPost]
        public JsonResult ConfirmChequeLeaveNoStatus([FromBody]ChequeInfoVm Cheque)
        {
            var result = RetailUnitOfWork.ChequeDetails.GetDetailedByAccountNo(Cheque.accountnumber);

            int? chequeId = null;

            foreach (var Item in result)
            {
              chequeId = Item.Id;
            }
           
            var chequeLeavesResult = RetailUnitOfWork.ChequeLeaves
                .GetByChequeBookID(chequeId)
                .ToList().Where(l => l.Leafno == Cheque.chequeleaveno && (l.Leafstatus == 1 || l.Leafstatus == 2));

            if(chequeLeavesResult.Count() > 0)
            {
                return Json(true);
            }
            else
            {
                //check if cheque number has been logged but has not been approved in inward cheque table
                var inwardChequeResult = RetailUnitOfWork.InwardCheques.GetByAccountNo(Cheque.accountnumber)
                    .ToList().Where(l => l.Chequeleaveno == Cheque.chequeleaveno.ToString());
                if (inwardChequeResult.Count() > 0)
                {
                    return Json(true);
                }else { 
                //.GetByChequeBookID(chequeId)
                return Json(false);
                }
            }


        }


        [HttpGet]
        public JsonResult LoadCurrentAccounts()
        {
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ChequeAccountEndpoint;
            var CustomerAccounts = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<SelectTwoContent> result =
                JsonConvert.DeserializeObject<IEnumerable<SelectTwoContent>>(CustomerAccounts, settings);
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadProducts() {
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.ProductEndpoint;
            var Products = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<ProductVM> result = 
                JsonConvert.DeserializeObject<IEnumerable<ProductVM>>(Products, settings);
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadCASAMandates(string id)
        {
            string Uri = ApiConstants.BaseApiUrl
                + ApiConstants.CASAMandateEndpoint
                + "/" + id.Trim();

            var CasaMandates = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            CASAMandatesVM result =
                JsonConvert.DeserializeObject<CASAMandatesVM>(CasaMandates, settings);
            return Json(result);
        }
        [HttpGet]
        public JsonResult LoadPrincipalGlId(string id)
        {
            
            
            
            
              #if DEBUG
              //link to controller in customer module...for use in development mode
              // string Uri = "http://localhost:1659/Account/GetCasaProductGlByAccNo" + "/" + id.Trim();
               string Uri = ApiConstants.BaseApiUrl + ApiConstants.PrincipalGLIdEndpoint + "/" + id.Trim();

              #else
               
               string Uri = ApiConstants.BaseApiUrl + ApiConstants.PrincipalGLIdEndpoint + "/" + id.Trim();

              #endif
            var CasaMandates = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            //CASAMandatesVM result =
               // JsonConvert.DeserializeObject<CASAMandatesVM>(CasaMandates, settings);
            return Json(CasaMandates);
        }

        [HttpGet]
        public JsonResult LoadMandateDocList(int id)
        {
            string Uri = ApiConstants.BaseApiUrl
                + ApiConstants.CASAMandateDocListEndpoint
                + "/" + id;
            var DocList = RetailUnitOfWork.API.GetAsync(Uri).Result;
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            IEnumerable<CASAMandateDocVM> result =
                JsonConvert.DeserializeObject<IEnumerable<CASAMandateDocVM>>(DocList, settings);
            return Json(result);
        }

        [HttpGet]
        public IActionResult LoadMandateDoc(int id)
        {
            string Uri = ApiConstants.BaseApiUrl
                + ApiConstants.CASAMandateDocEndpoint
                + "/" + id;
            return Redirect(Uri);
        }

        [HttpGet]
        public JsonResult LoadInwardCheques()
        {
            var result = RetailUnitOfWork.InwardCheques.GetAll();
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadOutwardCheques()
        {
            var result = RetailUnitOfWork.OutwardCheques.GetNonCancelled();
            // TODO: Filter by application date (from finance API)
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadOutwardOperationCheques()
        {
            var result = RetailUnitOfWork.OutwardCheques.GetOperationRows();
            // TODO: Filter by application date (from finance API)
            return Json(result);
        }

        [HttpGet]
        public JsonResult LoadBankLedgers()
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
                    Text = $"{item.AccountName} [{item.Id}]"
                });
            }
            return Json(list);
        }

        [HttpGet]
        public IActionResult LoadDocument(int id)
        {
            TblKycdocuments document;
            using (var db = new TheCoreBanking_FilesContext())
            {
                document = db.TblKycdocuments
                    .Where(k => k.Id == id)
                    .Where(k => k.Isdeleted == false)
                    .Select(k => new TblKycdocuments
                    {
                        Filedata = k.Filedata,
                        Mime = k.Mime
                    })
                    .SingleOrDefault();
            };
            if (document == null) return BadRequest();
            return File(document.Filedata, document.Mime);
        }

        #endregion

        // utilities
        struct ChequeLeavesContainer
        {
            public IEnumerable<TblChequeleavesdetail> Used;
            public IEnumerable<TblChequeleavesdetail> Stopped;
        }

        public struct ChequeStopLeaves
        {
            public IEnumerable<int> ToStop;
            public IEnumerable<int> Stopped;
            public int ChequeBookId;
        }

        public struct AccountCheques
        {
            public int ID;
            public string AccountNo;
            public int Start;
            public int End;
            public int LeavesNo;
        }

        public static string GetRandNo(int length)
        {
            byte[] number = new byte[6];
            new Random().NextBytes(number);
            var random = new BigInteger(number).ToString();
            return random.Substring(random.Length - length);
        }

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

        private decimal? GetStampDutyAmount() {
            var settings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            string Uri = ApiConstants.BaseApiUrl + ApiConstants.StampDutyChargeEndpoint;
            var Charges = JsonConvert.DeserializeObject<IEnumerable<StampDutyChargeVM>>
                (
                    RetailUnitOfWork.API.GetAsync(Uri).Result,
                    settings
                );
            if (Charges.Count() < 1) {
                return null;
            }
            return Charges.First().Charge;
        }

    }

}