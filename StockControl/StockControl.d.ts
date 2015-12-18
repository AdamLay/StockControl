interface IUser
{
  Id?: number;
  Username: string;
  Password: string;
  AuthToken?: string;
}

interface IAuthToken
{
  Token: string;
  Username: string;
}

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

interface IStockAdjust
{
  Id: number;
  Quantity: number;
}

interface IAuditEntry<T> extends IModel
{
  Title: string;
  Message: string;
  Timestamp: string;
  OriginalData?: T;
  NewData?: T;
}

interface IModalDialog
{
  Id: string;
  Title: string;
  Message: string;
  OnClick: string;
  ButtonLabel: string;
}
