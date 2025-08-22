import { QueryResult, type Client } from "pg";
import { generateToken, tokens, verifyAccessToken} from "../Authentication/Auth";
import crypto from "crypto";

export type userDetails = {
  name: string;
  email: string;
  password: string;
};
export type expense = {
  category: string;
  title: string;
  description: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

interface User{
  createUser:(userDetails:userDetails) => Promise<string | tokens>
  updateUser:(userDetails:Partial<userDetails>) => Promise<string>
  deleteUser:() => Promise<string>
  getUser:() => Promise<userDetails | string>
  loginUser:(userDetails:Omit<userDetails,"name">) => Promise<string | tokens>
}
interface Expense{
  createExpense:(expense:expense) => Promise<string>,
  getExpense:(expenseId:string) => Promise<expense | string>
  getExpenses:() => Promise<expense[] | string>
  updateExpense:(expenseId:string,expenseDetails:Partial<expense>) => Promise<string>,
  deleteExpense:(expenseId:string) => Promise<string | null>,
  deleteExpenses:() => Promise<string | null>
}

export class PostGresDb{
  protected client:Client;

  constructor(client:Client){
    this.client = client
  }

  async tableExists(tableName:"users" | "expenses"):Promise<true | null>{
    try {
      await this.client.query(
        `SELECT * FROM ${tableName == "users" ? "users" : "expenses"}`
      );

      return true;
    } catch (error) {
      return null;
    }
  }
}
export class UserDB extends PostGresDb implements User{
  userToken?:string

  constructor(clientDB:Client,userToken?:string){
    super(clientDB)
    this.userToken = userToken;
  }

  protected authenticateUser():boolean | Object{
    if(this.userToken){
      const tokenValidator = verifyAccessToken(this.userToken)
      
      if(tokenValidator instanceof Error || typeof tokenValidator == 'string')
        return false
      return tokenValidator
    }
    else return false
  }

  async createUser(userDetails:userDetails): Promise<string | tokens>{
    const userKeys = ["name","email","password"],
      checkForKeys = userKeys.every(key => Object.keys(userDetails).includes(key));
    
    if(!checkForKeys)
      return "Ensure all keys are present in the json body"
    else{
      for(let [key,value] of Object.entries(userDetails)){
        if(key == 'email'){
          if(value.length < 0)
            return "Email length invalid"
          else if(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(value) == false)
            return "Email is invalid";
        }
        else if(key == 'password'){
          if(value.length <= 3 || value.length > 16)
            return "Password length is invalid. Varying 3-16"
        }
        else{
          if(value.length <= 0)
            return "Name is invalid";
        }
      }

      try{
        const userId = crypto.randomUUID(),
          tableExists = await this.tableExists("users"),
          userObject = {...userDetails,id:userId},
          userToken = generateToken(userObject)

        if(userToken instanceof Error == false){
          if(tableExists)
            await this.client.query("INSERT INTO users(id,name,email,password) VALUES($1,$2,$3,$4)",[
              userId,...Object.values(userDetails)
            ])
          else{
            await this.client.query("CREATE TABLE users(id UUID,name TEXT,email TEXT UNIQUE,password TEXT)")
            await this.client.query("INSERT INTO users(id,name,email,password) VALUES($1,$2,$3,$4)",[
              userId,...Object.values(userDetails)
            ])
          }

          return{
            accessToken:userToken.accessToken,
            refreshToken:userToken.refreshToken
          }
        }
        else
          return "User creation failed"
      }
      catch(error){
        return (error as Error).message
      }
    }
  }

  async updateUser(userDetails:Partial<userDetails>):Promise<string>{
    const tableExists = await this.tableExists("users")

    if(!tableExists)
      return "User table doesn't exist"

    const user = this.authenticateUser()

    if(user instanceof Object){
      try{
        for(let [key,value] of Object.entries(userDetails)){
          if(key == 'email'){
            if(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(value) == false)
              return "Email format invalid."  
          }
          else if(key == 'password'){
            if(value.length <= 3 || value.length > 16)
              return `Password length is invalid. Ranging 3-16 characters`
          }
          else if(key == 'name'){
            if(value.length <= 0)
              return `${key} has an empty value`
          }
          else continue;

          await this.client.query(`UPDATE users SET ${key}=$1 WHERE id::text=$2`,[value,(user as any).id])
        }
      }
      catch(error){
        return (error as Error).message
      }

      return "Update successful"
    } else return "Authentication failed"
  }

  async deleteUser():Promise<string>{
    if(this.userToken){
      const user = this.authenticateUser()

      if(user instanceof Object){
        try{
          const expenseDB = new ExpenseDB(this.client,this.userToken),
            expenseDeletion = await expenseDB.deleteExpenses()
          
          if(expenseDeletion != "Expenses deleted")
            return `Expense deletion failed, user not deleted. Reason: ${expenseDeletion}`
          else{
            await this.client.query("DELETE FROM users WHERE id::text=$1",[(user as any).id])

            return "User deleted successfully"
          }
        }
        catch(error){
          return (error as Error).message
        }
      }
      else return "Authentication failed"
    } else return "User id absent"
  }

  async getUser():Promise<userDetails | string>{
    const user = this.authenticateUser(),
      tableExists = await this.tableExists("users")
    
    if(user instanceof Object){
      try{
        if(tableExists){
          let userObject = await this.client.query("SELECT * FROM users WHERE id::text=$1",[(user as any).id])
          
          if(userObject.rowCount && userObject.rowCount > 0){
            let userObj = userObject.rows[0]

            if(userObj.password)
              delete userObj.password

            return userObj
          }
          
          else return "User doesn't exist"
        }
        else return "User table not created."
      }
      catch(error){
        return (error as Error).message
      }
    }
    else return "User not validated"
  }

  async loginUser(userDetails:Omit<userDetails,"name">):Promise<string | tokens>{
    const keys = ["email","password"],
      keyChecker = keys.every(key => Object.keys(userDetails).includes(key))

    if(!keyChecker)
      return "Provide email and password in request body"

    try{
      const userRetrieval:QueryResult<any> = await this.client.query("SELECT * FROM users WHERE email=$1",[userDetails.email])

      if(userRetrieval.rowCount && userRetrieval.rowCount > 0){
        const user = userRetrieval.rows[0]

        if(user.password == userDetails.password){
          if(user.password)
            delete user?.password

          const userToken = generateToken(user)

          if(userToken instanceof Error)
            return userToken.message
          else return userToken      
        }
        else return "Incorrect password";
      }
      else return "User doesn't exist"
    }
    catch(error){
      return (error as Error).message
    }
  }
}
export class ExpenseDB extends UserDB implements Expense{
  constructor(dbClient:Client,userToken:string){
    super(dbClient,userToken);
  }

  async createExpense(expense:expense):Promise<string>{
    const userObject = this.authenticateUser();

    if(userObject instanceof Object){
      const tableExists = await this.tableExists("expenses"),
        expenseId = crypto.randomUUID(),
        expenseKeys = ["category","title","description","createdAt","updatedAt","amount"],
        checkKeysPresent = expenseKeys.every(key => Object.keys(expense).includes(key))

      if(!tableExists){
        try{
          await this.client.query("CREATE TABLE expenses(id UUID NOT NULL PRIMARY KEY,user_id NOT NULL REFERENCES user(id),title TEXT NOT NULL,description TEXT, category TEXT,amount INT, created_at DATE,updated_at DATE)")
        }
        catch(error){
          return `Database error, ${(error as Error).message}`
        }
      }

      if(checkKeysPresent){
          for(let [key,value] of Object.entries(expense)){
            if(key == 'amount'){
              if((value as number) < 0)
                return "Amount cannot be negative"
            }
            else if(key == 'createdAt' || key == 'lastUpdated'){
              const dateRegex=/^\d{4}-\d{2}-\d{2}$/g

              if(!dateRegex.test(value as string)){
                return `Invalid date passed in for ${key}`
              }
            }
            else{
              if((value as string).length <= 0)
                return `${key} has an empty value. Not allowed.`
            }
          }

          try{
            await this.client.query("INSERT INTO expenses(id,user_id,title,description,category,created_at,updated_at,amount) VALUES($1,$2,$3,$4,$5,$6,$7,$8);",[
              expenseId,(userObject as any).id,expense.title,expense.description,expense.category,expense.createdAt,expense.updatedAt,expense.amount
            ])

            return "Expense created successfully"
          }
          catch(error){
            return `Database error, ${(error as Error).message}`
          }
      }
      else return `Incomplete details, ensure to provide title,description, category, amount, createdAt and updatedAt fields`
    }
    else return `User object invalid ${userObject}`
  }

  async getExpense(expenseId:string):Promise<expense | string>{
    const tableExists = await this.tableExists("expenses")

    if(!tableExists){
      try {
        await this.client.query("CREATE TABLE expenses(id UUID NOT NULL PRIMARY KEY,user_id NOT NULL REFERENCES user(id),title TEXT NOT NULL,description TEXT, category TEXT,amount INT, created_at DATE,updated_at DATE)")
      } catch(error) {
        return `Database Error, ${(error as Error).message}`
      }

      return "Expense table not created"
    }

    const userObject = this.authenticateUser()

    if(userObject instanceof Object){
      try{
        const expenseQuery:QueryResult<expense> = await this.client.query("SELECT * FROM expenses WHERE id::text=$1 AND user_id::text=$2",[expenseId,(userObject as any).id])

        if(expenseQuery.rowCount && expenseQuery.rowCount > 0)
          return expenseQuery.rows[0]
        else return "No such expense found"
        
      }
      catch(error){
        return `Error, ${error}`
      }
    } else return `User object invalid, ${typeof userObject}`
  }

  async getExpenses():Promise<expense[] | string>{
    const tableExists = await this.tableExists("expenses")

    if(!tableExists){
      try {
        await this.client.query("CREATE TABLE expenses(id UUID NOT NULL PRIMARY KEY,user_id NOT NULL REFERENCES user(id),title TEXT NOT NULL,description TEXT, category TEXT,amount INT, created_at DATE,updated_at DATE)")
      } catch(error) {
        return `Database Error, ${(error as Error).message}`
      }

      return "Expense table not created"
    }

    const userObject = this.authenticateUser()

    if(userObject instanceof Object){
      try{
        const expensesQuery:QueryResult<expense> = await this.client.query("SELECT e.id,e.title,e.description,e.category,e.amount,e.created_at,e.updated_at FROM expenses e INNER JOIN USERS u ON e.user_id=u.id")

        if(expensesQuery.rowCount && expensesQuery.rowCount > 0)
          return expensesQuery.rows

        return "Empty expenses"
      }
      catch(error){
        return `Database error, ${(error as Error).message}`
      }
    }
    else return `Invalid user Object, ${typeof userObject}` 
  }

  async updateExpense(expenseId:string,expenseDetails:Partial<expense>):Promise<string>{
    const tableExists = await this.tableExists("expenses")

    if(!tableExists){
      try {
        await this.client.query("CREATE TABLE expenses(id UUID NOT NULL PRIMARY KEY,user_id NOT NULL REFERENCES user(id),title TEXT NOT NULL,description TEXT, category TEXT,amount INT, created_at DATE,updated_at DATE)")
      } catch(error) {
        return `Database Error, ${(error as Error).message}`
      }

      return "Expense table not created"
    }

    const userObject = this.authenticateUser(),
      date = new Date(),
      formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

    if(userObject instanceof Object){
      try {
        for (let [key, value] of Object.entries(expenseDetails)) {
          if(key == 'amount'){
              if((value as number) < 0)
                return "Amount cannot be negative"
          }
          else if(key == 'title' || key == 'category' || 'description'){
            if((value as string).length <= 0)
              return `${key} has an empty value. Not allowed.`
            }
          else continue;

          await this.client.query(`UPDATE expenses SET ${key}=$1 WHERE id::text=$2 AND user_id::text=$3`,
            [value, expenseId, (userObject as any).id]
          );
          await this.client.query(`UPDATE expenses SET updated_at=$1 WHERE id::text=$2 AND user_id::text=$3`,
            [formattedDate, expenseId, (userObject as any).id]
          );
        }

        return "Update successful";
      } catch (error) {
      return (error as Error).message;
      }
    }
    else return `User object undefined, ${typeof userObject}`

  }

  async deleteExpense(expenseId:string):Promise<string>{
    const userObject = this.authenticateUser()

    if(userObject instanceof Object){
      try{
        await this.client.query("DELETE FROM expenses WHERE id::text=$1 AND user_id::text=$2",[
          expenseId,(userObject as any).id
        ])

        return "Expense deleted"
      }
      catch(error){
        return `Database Error, ${(error as Error).message}`
      }
    } else return "Authentication failed"
  }

  async deleteExpenses():Promise<string>{
    const userObject = this.authenticateUser()
    
    if(userObject instanceof Object){
      try{
        await this.client.query("DELETE FROM expenses WHERE user_id::text=$1",[(userObject as any).id])

        return "Expenses deleted"
      }
      catch(error){
        return `Database error, ${(error as Error).message}`
      }
    } else return "Authentication failed"
  }
}