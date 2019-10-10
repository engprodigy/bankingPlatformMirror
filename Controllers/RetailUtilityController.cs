using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using TheCoreBanking.Retail.ViewModels;


namespace TheCoreBanking.Retail.Controllers
{
    public class RetailUtilityController : Controller
    {
        private ISetupUnitOfWork SetupUnitOfWork { get; }
        private Finance.Data.Contracts.ISetupUnitOfWork FinanceUnitOfWork { get; }
        public RetailUtilityController(ISetupUnitOfWork setupUnitOfWork, Finance.Data.Contracts.ISetupUnitOfWork financeUnitOfWork)
        {
            SetupUnitOfWork = setupUnitOfWork;
            FinanceUnitOfWork = financeUnitOfWork;
        }

        [HttpGet]
        public JsonResult GetBranch()
        {
            try
            {
                var branches = SetupUnitOfWork.Branch.GetAll();//.Where(p => p.CoyId == companyId);
                var lstbranch = new List<SelectTwoContent>();
                foreach (var branch in branches)
                {
                    lstbranch.Add(new SelectTwoContent()
                    {
                        Id = branch.Id.ToString(),
                        Text = branch.BrName
                    });
                }
                return Json(lstbranch);
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }
        
        [HttpGet]
        public JsonResult GetChartOfAccountByBranch()
        {
            try
            {
                var chartOfAccount = FinanceUnitOfWork.Chart.GetAll();//.Where(p => p.BrId == branchId && p.CoyId == companyId);
                var lstChart = new List<SelectTwoContent>();
                foreach (var item in chartOfAccount)
                {
                    lstChart.Add(new SelectTwoContent()
                    {
                        Id = item.Id.ToString(),
                        Text=item.AccountName
                    });
                }
                return Json(lstChart);
            }
            catch (Exception ex)
            {
                return Json("An error occurred " + ex.Message);
            }
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}