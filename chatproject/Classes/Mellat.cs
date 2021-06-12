﻿using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Web;

namespace chatproject.Classes
{
    
    public class Mellat
    {
    }
    public class Helper
    {
        public static String PreparePOSTForm(string url, NameValueCollection data)
        {
            string formID = "PostForm";
                        StringBuilder strForm = new StringBuilder();
            strForm.Append("<form id=\"" + formID + "\" name=\"" + formID + "\" action=\"" + url + "\" method=\"POST\" >");
            foreach (string key in data)
            {
                strForm.Append("<input type=\"hidden\" name=\"" + key + "\" value=\"" + data[key] + "\" >");
            }
            strForm.Append("</form >");
            StringBuilder strScript = new StringBuilder();
            strScript.Append("<script language='javascript'>");
            strScript.Append("var v" + formID + " = document." + formID + ";");
            strScript.Append("v" + formID + ".submit();");
            strScript.Append("</script >");
            return strForm.ToString() + strScript.ToString();
        }
    }

    public  enum MellatBankReturnCode
    {
        ﺗﺮاﻛﻨﺶ_ﺑﺎ_ﻣﻮﻓﻘﻴﺖ_اﻧﺠﺎم_ﺷﺪ = 0,
        ﺷﻤﺎره_ﻛﺎرت_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 11,
        ﻣﻮﺟﻮدی_ﻛﺎﻓﻲ_ﻧﻴﺴﺖ = 12,
        رﻣﺰ_ﻧﺎدرﺳﺖ_اﺳﺖ = 13,
        ﺗﻌﺪاد_دﻓﻌﺎت_وارد_ﻛﺮدن_رﻣﺰ_ﺑﻴﺶ_از_ﺣﺪ_ﻣﺠﺎز_اﺳﺖ = 14,
        ﻛﺎرت_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 15,
        دﻓﻌﺎت_ﺑﺮداﺷﺖ_وﺟﻪ_ﺑﻴﺶ_از_ﺣﺪ_ﻣﺠﺎز_اﺳﺖ = 16,
        ﻛﺎرﺑﺮ_از_اﻧﺠﺎم_ﺗﺮاﻛﻨﺶ_ﻣﻨﺼﺮف_ﺷﺪه_اﺳﺖ = 17,
        ﺗﺎرﻳﺦ_اﻧﻘﻀﺎی_ﻛﺎرت_ﮔﺬﺷﺘﻪ_اﺳﺖ = 18,
        ﻣﺒﻠﻎ_ﺑﺮداﺷﺖ_وﺟﻪ_ﺑﻴﺶ_از_ﺣﺪ_ﻣﺠﺎز_اﺳﺖ = 19,


        ﺻﺎدر_ﻛﻨﻨﺪه_ﻛﺎرت_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 111,
        ﺧﻄﺎی_ﺳﻮﻳﻴﭻ_ﺻﺎدر_ﻛﻨﻨﺪه_ﻛﺎرت = 112,
        ﭘﺎﺳﺨﻲ_از_ﺻﺎدر_ﻛﻨﻨﺪه_ﻛﺎرت_درﻳﺎﻓﺖ_ﻧﺸﺪ = 113,
        دارﻧﺪه_ﻛﺎرت_ﻣﺠﺎز_ﺑﻪ_اﻧﺠﺎم_اﻳﻦ_ﺗﺮاﻛﻨﺶ_ﻧﻴﺴﺖ = 114,


        ﭘﺬﻳﺮﻧﺪه_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 21,
        ﺧﻄﺎی_اﻣﻨﻴﺘﻲ_رخ_داده_اﺳﺖ = 23,
        اﻃﻼﻋﺎت_ﻛﺎرﺑﺮی_ﭘﺬﻳﺮﻧﺪه_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 24,
        ﻣﺒﻠﻎ_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 25,
        ﭘﺎﺳﺦ_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 31,
        ﻓﺮﻣﺖ_اﻃﻼﻋﺎت_وارد_ﺷﺪه_ﺻﺤﻴﺢ_ﻧﻤﻲ_ﺑﺎﺷﺪ = 32,
        ﺣﺴﺎب_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 33,
        ﺧﻄﺎی_ﺳﻴﺴﺘﻤﻲ = 34,
        ﺗﺎرﻳﺦ_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 35,
        ﺷﻤﺎره_درﺧﻮاﺳﺖ_ﺗﻜﺮاری_اﺳﺖ = 41,
        ﺗﺮاﻛﻨﺶ_Sale_یافت_نشد_ = 42,
        ﻗﺒﻼ_Verify_درﺧﻮاﺳﺖ_داده_ﺷﺪه_اﺳﺖ = 43,
        درخواست_verify_یافت_نشد = 44,
        ﺗﺮاﻛﻨﺶ_Settle_ﺷﺪه_اﺳﺖ = 45,
        ﺗﺮاﻛﻨﺶ_Settle_نشده_اﺳﺖ = 46,
        ﺗﺮاﻛﻨﺶ_Settle_یافت_نشد = 47,
        تراکنش_Reverse_شده_است = 48,
        تراکنش_Refund_یافت_نشد = 49,


        شناسه_قبض_نادرست_است = 412,
        ﺷﻨﺎﺳﻪ_ﭘﺮداﺧﺖ_ﻧﺎدرﺳﺖ_اﺳﺖ = 413,
        سازﻣﺎن_ﺻﺎدر_ﻛﻨﻨﺪه_ﻗﺒﺾ_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 414,
        زﻣﺎن_ﺟﻠﺴﻪ_ﻛﺎری_ﺑﻪ_ﭘﺎﻳﺎن_رسیده_است = 415,
        ﺧﻄﺎ_در_ﺛﺒﺖ_اﻃﻼﻋﺎت = 416,
        ﺷﻨﺎﺳﻪ_ﭘﺮداﺧﺖ_ﻛﻨﻨﺪه_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 417,
        اﺷﻜﺎل_در_ﺗﻌﺮﻳﻒ_اﻃﻼﻋﺎت_ﻣﺸﺘﺮی = 418,
        ﺗﻌﺪاد_دﻓﻌﺎت_ورود_اﻃﻼﻋﺎت_از_ﺣﺪ_ﻣﺠﺎز_ﮔﺬﺷﺘﻪ_اﺳﺖ = 419,
        IP_نامعتبر_است = 421,

        ﺗﺮاﻛﻨﺶ_ﺗﻜﺮاری_اﺳﺖ = 51,
        ﺗﺮاﻛﻨﺶ_ﻣﺮﺟﻊ_ﻣﻮﺟﻮد_ﻧﻴﺴﺖ = 54,
        ﺗﺮاﻛﻨﺶ_ﻧﺎﻣﻌﺘﺒﺮ_اﺳﺖ = 55,
        ﺧﻄﺎ_در_واریز = 61
    }


}