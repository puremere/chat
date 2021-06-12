namespace chatproject.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class level2 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.messages", "date", c => c.DateTime(nullable: false));
            AlterColumn("dbo.messages", "time", c => c.Time(nullable: false, precision: 7));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.messages", "time", c => c.DateTime(nullable: false));
            DropColumn("dbo.messages", "date");
        }
    }
}
