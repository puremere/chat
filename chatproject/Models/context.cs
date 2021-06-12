using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace chatproject.Models
{
    public class context : DbContext
    {
        public context() : base("messageDB")
        {
            Database.SetInitializer<context>(new MigrateDatabaseToLatestVersion<context, chatproject.Migrations.Configuration>());

        }
        public DbSet<message> messages { get; set; }
        public DbSet<group> groups { get; set; }
        public DbSet<user> users { get; set; }
    }

    public class message
    {
        [Key]
        public Guid messageID { get; set; }
        //public DateTime date { get; set; }
        //public TimeSpan time { get; set; }
        public string type { get; set; }
        public string progressID { get; set; }
        public string username { get; set; }
        public string content { get; set; }
        public string  groupToken { get; set; }
        public Guid groupID { get; set; }
        public group group { get; set; }
    }

    public class user
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid userID { get; set; }
        public string connectionID { get; set; }
        public string username { get; set; }
        public Guid groupID { get; set; }
        public group group { get; set; }

    }
    public class group
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public Guid groupID { get; set; }
        public string  title { get; set; }
        public string  token { get; set; }
        public ICollection<message> messages { get; set; }
        public ICollection<user> users { get; set; }
    }
}