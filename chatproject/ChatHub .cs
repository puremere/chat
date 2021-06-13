﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using banimo.ScreenModels;
using System.Net;
using System.IO;
using chatproject.Models;

namespace education2
{
    public class ChatHub : Hub
    {
        dbManager manager = new dbManager();
        public void Send(string name, string message, string type,string groupname)
        {
            if (type == "send")
            {
                // Call the addNewMessageToPage method to update clients.
                Clients.Group(groupname).addNewMessageToPage(name, message);
            }
            else if (type == "JG")
            {
                this.Groups.Add(this.Context.ConnectionId, groupname);
            }
           
        }
        private static readonly List<User> Users = new List<User>();
        private static readonly List<UserCall> UserCalls = new List<UserCall>();
        private static readonly List<CallOffer> CallOffers = new List<CallOffer>();
        public static string isChnager = "";
        public void Hang(string username)
        {
           
        }
        public async Task  Join(string groupname , string username,string type)
        {
            User user = Users.SingleOrDefault(x => x.Username == username && x.GroupName == groupname);
            if (user != null)
            {
                Groups.Remove(user.ConnectionId, groupname);
                Groups.Add(Context.ConnectionId, groupname);
                user.ConnectionId = Context.ConnectionId;

            }
            else
            {
                

                // Add the new user
                Users.Add(new User
                {
                    Username = username,
                    ConnectionId = Context.ConnectionId,
                    GroupName = groupname,
                    Type = type
                });
                await Groups.Add(Context.ConnectionId, groupname);
                // Send down the new list to all clients
                SendUserListUpdate(groupname);

                Guid? groupID = getGroupID(groupname);
                if (groupID != null)
                {
                    addUser(new user()
                    {
                        connectionID = Context.ConnectionId,
                        groupID = (Guid)groupID,
                        username = username,

                    }, groupname);
                    // getChat(Context.ConnectionId, groupname).Wait();
                }
            }

            
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool boolian)
        {
            // Hang up any calls the user is in
            HangUp(""); // Gets the user from "Context" which is available in the whole hub

            
            
            var item  = Users.FirstOrDefault(u => u.ConnectionId == Context.ConnectionId);
            if (item != null)
            {
                Users.RemoveAll(u => u.ConnectionId == Context.ConnectionId);
                string Groupname = item.GroupName;
                Groups.Remove(Context.ConnectionId, Groupname);
                SendUserListUpdate(Groupname);
            }
           
            // Send down the new user list to all clients
          

            return base.OnDisconnected(boolian);
        }
        public void DeleteRelayFromList()
        {
            Users.RemoveAll(u => u.Username == "relay");
            string Groupname = Users.FirstOrDefault(u => u.ConnectionId == Context.ConnectionId).GroupName;
            SendUserListUpdate(Groupname);
        }

        public void CallUser(string targetConnectionId,string type)
        {
            isChnager = type;
            string groupname = Users.SingleOrDefault(c => c.ConnectionId == Context.ConnectionId).GroupName;
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Users.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            // Make sure the person we are trying to call is still here
            if (targetUser == null)
            {
                // If not, let the caller know
                Clients.Caller.callDeclined(targetConnectionId, "مخاطب در دسترس نیست");
                SendUserListUpdate(groupname);
                return;
            }

            //// And that they aren't already in a call
            //if (GetUserCall(targetUser.ConnectionId) != null)
            //{
            //    Clients.Caller.callDeclined(targetConnectionId, string.Format("{0} is already in a call.", targetUser.Username));
            //    return;
            //}

            // They are here, so tell them someone wants to talk
            Clients.Client(targetConnectionId).incomingCall(callingUser);
            
            // Create an offer
            CallOffers.Add(new CallOffer
            {
                Caller = callingUser,
                Callee = targetUser
            });
        }
        public void SendRelay(string groupname)
        {
              string html = string.Empty;
             // string url = @"http://localhost:8085/openChrome?groupname="+ groupname ;
            string url = @"http://194.5.205.84:8081/?groupname="+ groupname ;
          
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.AutomaticDecompression = DecompressionMethods.GZip;

            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                html = reader.ReadToEnd();
            }
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            Clients.Client(Context.ConnectionId).relayCallBack(html.Replace("portis", ""));
           
        }
        public void KillRelay(string id)
        {
            string html = string.Empty;
            // string url = @"http://localhost:8082/closeChrome?id=" + id;
            //

            string url = @"http://194.5.205.84:8083/?id=" + id;

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.AutomaticDecompression = DecompressionMethods.GZip;

            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            using (Stream stream = response.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                html = reader.ReadToEnd();
            }
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            Clients.Client(Context.ConnectionId).relayCallBack(html.Replace("portis", ""));
        }
        public void RefreshUser() {
            string groupname = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).GroupName;
            SendUserListUpdate(groupname);
        }

        public void HideVideoOnClient(string groupname ,string index)
        {
            Clients.Group(groupname).HideYourVideo(index);
        }
        public void ShowVideoOnClient(string groupname, string index)
        {
            Clients.Group(groupname).ShowYourVideo(index);
        }
        public void AnswerCall(bool acceptCall, string targetConnectionId)
        {
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Users.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            // This can only happen if the server-side came down and clients were cleared, while the user
            // still held their browser session.
            if (callingUser == null)
            {
                return;
            }

            // Make sure the original caller has not left the page yet
            if (targetUser == null)
            {
                Clients.Caller.callEnded(targetConnectionId, "The other user in your call has left.");
                return;
            }

            // Send a decline message if the callee said no
            if (acceptCall == false)
            {
                Clients.Client(targetConnectionId).callDeclined(callingUser, string.Format("{0} did not accept your call.", callingUser.Username));
                return;
            }

            // Make sure there is still an active offer.  If there isn't, then the other use hung up before the Callee answered.
            //var offerCount = CallOffers.RemoveAll(c => c.Callee.ConnectionId == callingUser.ConnectionId
            //                                      && c.Caller.ConnectionId == targetUser.ConnectionId);
            //if (offerCount <1)
            //{
            //    Clients.Caller.callEnded(targetConnectionId, string.Format("{0} تماس را زودتر قطع کرده است.", targetUser.Username));
            //    return;
            //}

            // And finally... make sure the user hasn't accepted another call already
            //if (GetUserCall(targetUser.ConnectionId) != null)
            //{
            //    // And that they aren't already in a call
            //    Clients.Caller.callDeclined(targetConnectionId, string.Format("{0} در حال تماس با فرد دیگری می باشد :(", targetUser.Username));
            //    return;
            //}

            // Remove all the other offers for the call initiator, in case they have multiple calls out
            CallOffers.RemoveAll(c => c.Caller.ConnectionId == targetUser.ConnectionId);

            // Create a new call to match these folks up
            UserCalls.Add(new UserCall
            {
                
               Users = new List<User> { callingUser, targetUser },
            });


            // Tell the original caller that the call was accepted
            //.Client(Context.ConnectionId).alertID(isChnager);
            Clients.Client(targetConnectionId).callAccepted(callingUser, isChnager, callingUser.Username);

            // Update the user list, since thes two are now in a call
           // SendUserListUpdate("");
        }

        public void callEveryOne(string GeustConnectionID)
        {
            User user = Users.SingleOrDefault(c => c.ConnectionId == Context.ConnectionId);
            if (user != null)
            {
                List<User> UserList = Users.Where(x => x.GroupName == user.GroupName && x.ConnectionId != user.ConnectionId && x.ConnectionId != GeustConnectionID ).ToList();
                
                foreach ( User guest in UserList )
                {
                    Clients.Client(guest.ConnectionId).callEveryOne(user.ConnectionId);
                }
                //User Admin = g.SingleOrDefault(x => x.GroupName == user.GroupName && x.Type == "admin");
                //Clients.Client(Admin.ConnectionId).callEveryOne(user.ConnectionId);

            }
        }
        public void resPonseToCallEveryOne(string requestee)
        {
            
            Clients.Client(requestee).areYouStillThere(Context.ConnectionId);
        }
        public void StreamRequest(string connectionID,int type)
        {
            User user = Users.SingleOrDefault(c => c.ConnectionId == Context.ConnectionId);
            if (user != null)
            {
                User resposerUser = Users.SingleOrDefault(x => x.ConnectionId == connectionID);
                Clients.Client(connectionID).GetStreamRequest(user.ConnectionId, string.Format("{0} درخواست استریم دارد.", resposerUser.Username), resposerUser.Username,type);


            }
        }

        public   Guid? getGroupID (string groupName)
        {
            group obj =  manager.getGroupID(groupName);
            if (obj != null)
            {
                return obj.groupID;
            }
            else
            {
                var guid = (Guid?)null;
                return guid;
            }
        }
        public void  addUser(user model, string groupName)
        {
            manager.addUser(model);
            IEnumerable<message> lst = getChat(model.connectionID,groupName,"");
            Clients.Client(model.connectionID).loading(1);
            foreach (var item in lst.Reverse())
            {
                Clients.Client(model.connectionID).setMessage(item.content, "", item.username, item.type, item.progressID,item.messageID);
            }
            Clients.Client(model.connectionID).loading(0);

        }
        
        public  IEnumerable<message> getChat(string connectionID, string groupName,string id)
        {
            IEnumerable<message> lst =  manager.getMessagList(groupName,id);
            return lst;
        }

        public void getChatUpdate(string connectionID, string groupName, string id)
        {
            IEnumerable<message> lst = getChat(connectionID, groupName, id);
            Clients.Client(connectionID).loading(1);
            foreach (var item in lst)
            {
                Clients.Client(connectionID).setMessage(item.content, "", item.username, item.type, item.progressID, item.messageID,1);
            }
            Clients.Client(connectionID).loading(0);
        }

        public void SendChat(string message, string type, string progressID,string username,string groupname)
        {
            context dbcontext = new context();
            Clients.Group(groupname).setMessage(message, Context.ConnectionId, username, type, progressID);

            Guid? groupID = getGroupID(groupname);
            if (groupID == null)
            {
                group mygroup = new group()
                {
                    title = "class1",
                    token = groupname,
                };
                if (dbcontext.groups.Where(x=>x.token == groupname).ToList().Count() == 0)
                {
                    dbcontext.groups.Add(mygroup);
                    dbcontext.SaveChanges();
                }

                groupID = getGroupID(groupname);
            }
            Guid gui = System.Guid.NewGuid();
            manager.addMessage(new message()
            {
                content = message,
                progressID = progressID,
                type = type,
                username = username,
                groupID = (Guid)groupID,
                messageID = gui



            }).Wait();



        }

        public void SendMessage(string message,string partner,string type,string progressID)
        {

            string partnerID = partner;
            List<User> partnerIDlist = new List<User>();
            if (partner == "admin")
            {
                 partnerIDlist = Users.Where(x => x.Type == "admin").ToList();
                foreach (var item in partnerIDlist)
                {
                    string groupname = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).GroupName;
                    string name = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).Username;
                    Clients.Client(item.ConnectionId).setMessage(message, Context.ConnectionId, name, type,progressID);
                    Clients.Client(Context.ConnectionId).setMessage(message, Context.ConnectionId, name, type, progressID);
                }
            }
            else
            {
                string groupname = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).GroupName;
                string name = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).Username;
                Clients.Client(partner).setMessage(message, Context.ConnectionId, name, type, progressID);
                Clients.Client(Context.ConnectionId).setMessage(message, Context.ConnectionId, name, type, progressID);
            }
           
            
        }
       

        public void MessageRcieved(string connectionID, string progressID)
        {
            Clients.Client(connectionID).messageRecived(progressID);
        }
        public void HangUp(string partnerClientId)
        {
           // string groupname = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId).GroupName;

            if (partnerClientId == "")
            {

                var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

                if (callingUser == null)
                {
                    return;
                }

                var currentCall = GetUserCallList(callingUser.ConnectionId);

              
                // Send a hang up message to each user in the call, if there is one
                if (currentCall != null)
                {
                    foreach (var call in currentCall)
                    {

                        foreach (var user in call.Users.Where(u => u.ConnectionId != callingUser.ConnectionId))
                        {
                               Clients.Client(user.ConnectionId).callEnded(callingUser.ConnectionId, string.Format("{0} تماس را قطع کرد.", callingUser.Username));
                        }
                    }
                   

                    // Remove the call from the list if there is only one (or none) person left.  This should
                    // always trigger now, but will be useful when we implement conferencing.
                    foreach (var call in currentCall)
                    {
                        call.Users.RemoveAll(u => u.ConnectionId == callingUser.ConnectionId);
                        if (call.Users.Count <2)
                        {
                            UserCalls.Remove(call);
                        }
                    }
                   
                }
                Clients.Client(Context.ConnectionId).SetDefaultStream("0");

                // Remove all offers initiating from the caller
                CallOffers.RemoveAll(c => c.Caller.ConnectionId == callingUser.ConnectionId);

                //SendUserListUpdate(groupname);
            }
            else
            {
                var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

                if (callingUser == null)
                {
                    return;
                }

                var currentCall = GetUserCall(partnerClientId);

                // Send a hang up message to each user in the call, if there is one
                if (currentCall != null)
                {
                    Clients.Client(partnerClientId).callEnded(callingUser.ConnectionId, string.Format("{0} تماس را قطع کرد.", callingUser.Username));


                    UserCalls.Remove(currentCall);
                }

                // Remove all offers initiating from the caller
                CallOffers.RemoveAll(c => c.Caller.ConnectionId == callingUser.ConnectionId);

                //SendUserListUpdate(groupname);
            }
            
        }
        public void HangUpEcexpt(string partnerClientId)
        {
            string groupname = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId).GroupName;

            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);

            if (callingUser == null)
            {
                return;
            }

            var currentCall = GetUserCallList(callingUser.ConnectionId);
      
            currentCall.RemoveAll(uc => uc.Users.SingleOrDefault(u => u.ConnectionId == partnerClientId) != null);
         

            // Send a hang up message to each user in the call, if there is one
            if (currentCall != null)
            {
                foreach (var call in currentCall)
                {

                    foreach (var user in call.Users.Where(u => u.ConnectionId != callingUser.ConnectionId ))
                    {
                        Clients.Client(user.ConnectionId).callEnded(callingUser.ConnectionId, string.Format("{0} تماس را قطع کرد.", callingUser.Username));
                    }
                }


                // Remove the call from the list if there is only one (or none) person left.  This should
                // always trigger now, but will be useful when we implement conferencing.
                foreach (var call in currentCall)
                {
                    call.Users.RemoveAll(u => u.ConnectionId == callingUser.ConnectionId);
                    if (call.Users.Count <2)
                    {
                        UserCalls.Remove(call);
                    }
                }

            }

            // Remove all offers initiating from the caller
            CallOffers.RemoveAll(c => c.Caller.ConnectionId == callingUser.ConnectionId);

            //SendUserListUpdate(groupname);
        }
        public void resetAllConnction(string id) {

            Clients.Client(Context.ConnectionId).SetDefaultStream(id);
            string groupname = Users.SingleOrDefault(x => x.ConnectionId == Context.ConnectionId).GroupName;
           
            List<string> List = Users.Where(u => u.ConnectionId != Context.ConnectionId && u.ConnectionId != id && u.GroupName == groupname).Select(x=>x.ConnectionId).ToList();
           
            foreach (var item in List)
            {
               
                CallUser(item, "");
            }

            
        }
        
        // WebRTC Signal Handler
        public void SendSignal(string signal, string targetConnectionId)
        {
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Users.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            // Make sure both users are valid
            if (callingUser == null || targetUser == null)
            {
                return;
            }

            Clients.Client(targetConnectionId).receiveSignal(callingUser, signal);
            //// Make sure that the person sending the signal is in a call
            //var userCall = GetUserCall(callingUser.ConnectionId);

            //// ...and that the target is the one they are in a call with
            //if (userCall != null && userCall.Users.Exists(u => u.ConnectionId == targetUser.ConnectionId))
            //{
            //    // These folks are in a call together, let's let em talk WebRTC
               
            //}
        }
        public void SendSignalForStream(string signal, string targetConnectionId)
        {
            var callingUser = Users.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            Clients.Client(targetConnectionId).changeStream(signal, callingUser);

        }

        #region Private Helpers

        private void SendUserListUpdate(string groupname)
        {
           if (groupname != "")
            {
                List<User> SelectedUsers = Users.Where(u => u.GroupName == groupname).ToList();
                Clients.Group(groupname).updateUserList(SelectedUsers);
            }
          
        }

        private UserCall GetUserCall(string connectionId)
        {
            
            var matchingCall =
                UserCalls.SingleOrDefault(uc => uc.Users.SingleOrDefault(u => u.ConnectionId == connectionId ) != null);
            return matchingCall;
        }
        private List<UserCall> GetUserCallList (string connectionId)
        {
            var matchingCall =
                  UserCalls.Where(uc => uc.Users.SingleOrDefault(u => u.ConnectionId == connectionId) != null).ToList();
            return matchingCall;

        }

        #endregion


    }
}