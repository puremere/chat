namespace chatproject.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class InitialCreate : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.groups",
                c => new
                    {
                        groupID = c.Guid(nullable: false, identity: true),
                        title = c.String(),
                        token = c.String(),
                    })
                .PrimaryKey(t => t.groupID);
            
            CreateTable(
                "dbo.messages",
                c => new
                    {
                        messageID = c.Guid(nullable: false, identity: true),
                        type = c.String(),
                        progressID = c.String(),
                        username = c.String(),
                        content = c.String(),
                        groupToken = c.String(),
                        groupID = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.messageID)
                .ForeignKey("dbo.groups", t => t.groupID, cascadeDelete: true)
                .Index(t => t.groupID);
            
            CreateTable(
                "dbo.users",
                c => new
                    {
                        userID = c.Guid(nullable: false, identity: true),
                        connectionID = c.String(),
                        username = c.String(),
                        groupID = c.Guid(nullable: false),
                    })
                .PrimaryKey(t => t.userID)
                .ForeignKey("dbo.groups", t => t.groupID, cascadeDelete: true)
                .Index(t => t.groupID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.users", "groupID", "dbo.groups");
            DropForeignKey("dbo.messages", "groupID", "dbo.groups");
            DropIndex("dbo.users", new[] { "groupID" });
            DropIndex("dbo.messages", new[] { "groupID" });
            DropTable("dbo.users");
            DropTable("dbo.messages");
            DropTable("dbo.groups");
        }
    }
}
