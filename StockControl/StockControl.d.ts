interface IModel
{
  Id?: number;
}

interface IStockItem extends IModel
{
  Name: string;
  StockGroupId: number;
  StockGroup?: string;
  Quantity: number;
  Reorder: number;
}

interface IStockGroup extends IModel
{
  Name: string;
}

interface IAuditEntry extends IModel
{
  Title: string;
  Message: string;
  Timestamp: string;
}