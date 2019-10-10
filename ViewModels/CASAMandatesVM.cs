using System.Collections.Generic;

namespace TheCoreBanking.Retail.ViewModels
{
    public class CASAMandatesVM
    {
        public int CASAAccountId;
        public string AccountNumber;
        public string AccountName;
        public int ProductID;
        public decimal AvailableBalance;
        public decimal LedgerBalance;
        public int CurrencyID;
        public bool IsCurrentAccount;
        public List<MandateVM> TblMandate;
    }

    public class MandateVM
    {
        public int MandateID;
        public string SignatorySurname;
        public string SignatoryOthername;
        public string SignatoryFirstname;
        public string SignatoryEmail;
        public string SignatoryClass;
        public string BVN;
        public bool IsDeleted;
    }

}
