using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Data.Entity;

namespace chatproject.Models
{
    public class dbManager
    {
        public void addUser(user model)
        {
            
            using (context dbcontext = new context())
            {
                user user =  dbcontext.users.SingleOrDefault(l => l.username == model.username);
                if (user != null)
                {
                    user.connectionID = model.connectionID;
                }
                else
                {
                    dbcontext.users.Add(new user()
                    {
                        connectionID = model.connectionID,
                        groupID = model.groupID,
                        userID = model.userID,
                        username = model.username,
                    });
                }
               
                dbcontext.SaveChanges();
            }
        }


        public void addGroup(string groupname)
        {
            using (context dbcontext = new context())
            {
                group grup = dbcontext.groups.SingleOrDefault(l => l.title == groupname);
                if (grup == null)
                {
                    group newgroup = new group();
                    newgroup.groupID = Guid.NewGuid();
                    newgroup.title = groupname;
                    newgroup.token = groupname;
                    dbcontext.groups.Add(newgroup);
                }
                dbcontext.SaveChanges();
            }
        }
        public async Task  addMessage(message model)
         {
          
            using ( context dbcontext = new context())
            {
                TimeSpan time = DateTime.Now.TimeOfDay;
                if (!model.content.Contains("<body>"))
                {
                    dbcontext.messages.Add(new message
                    {
                        content = model.content,
                        username = model.username,
                        progressID = model.progressID,
                        type = model.type,
                        groupID = model.groupID,
                        messageID = model.messageID,
                        time = DateTime.Now.TimeOfDay,
                        date = DateTime.Now


                    });
                    dbcontext.SaveChanges();
                }
               
            }
        }
        public group getGroupID(string groupname)
        {
            context dbcontext = new context();
            List<group> lst =  dbcontext.groups.ToList();
            if (lst.Count() == 0)
            {
                dbcontext.groups.Add(new group()
                {
                    title = "class1",
                    token = "123",
                }
                );
                 dbcontext.SaveChangesAsync();
            }
            group obj =  dbcontext.groups.Where(x => x.token == groupname).ToList().First();
            return obj;
        }
        public  IEnumerable<message> getMessagList(string groupname,string id)
        {

            context dbcontext = new context();
            TimeSpan time = DateTime.Now.TimeOfDay;
            DateTime date = DateTime.Now;
            Guid guidid = new Guid();
            if (id != "")
            {
                guidid = Guid.Parse(id);
                message lstmessage = dbcontext.messages.SingleOrDefault(x => x.messageID == guidid);
                 time = lstmessage.time;
                 date = lstmessage.date;

            }
           
           
            group obj =  dbcontext.groups.Where(x => x.token == groupname).ToList().First();
            Guid groupID = obj.groupID;
            List <message> list =  (dbcontext.messages.Where(x => x.group.groupID == groupID && x.date <= date  && x.messageID != guidid).OrderByDescending(x=>x.date).ThenBy(x=>x.time).Take(15).ToList());  //.OrderByDescending(x=>x.time)


            return list;


        }
       


    }
}