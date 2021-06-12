namespace chatproject.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class level3 : DbMigration
    {
        public override void Up()
        {
            DropPrimaryKey("dbo.messages");
            AlterColumn("dbo.messages", "messageID", c => c.Guid(nullable: false, identity: true));
            AlterColumn("dbo.messages", "date", c => c.DateTime(nullable: false));
            AddPrimaryKey("dbo.messages", "messageID");
        }
        
        public override void Down()
        {
            DropPrimaryKey("dbo.messages");
            AlterColumn("dbo.messages", "date", c => c.DateTime(nullable: false));
            AlterColumn("dbo.messages", "messageID", c => c.Guid(nullable: false));
            AddPrimaryKey("dbo.messages", "messageID");
        }
    }
}
