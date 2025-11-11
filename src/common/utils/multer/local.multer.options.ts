import { randomUUID } from "crypto"
import { diskStorage } from "multer"
import type { Request } from "express"
import path from "path"
import { existsSync, mkdirSync } from "fs"
import { IMulterFile } from "../../interfaces/multer.interface"
import { BadRequestException } from "@nestjs/common"
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface"


export const localFileUpload=({folder='pubic',validation=[],fileSize=2}:{folder?:string,validation:string[],fileSize?:number}):MulterOptions=>{
    const bathePath=`uploads/${folder}`;

    return{
         storage:diskStorage({
        destination(req: Request, file:Express.Multer.File, callback) {
            const fullPath= path.resolve(`./${bathePath}`);
            if (!existsSync(fullPath)) {
                mkdirSync(fullPath,{recursive:true})
            }
            callback(null,fullPath)
        },
        filename(req: Request, file:IMulterFile, callback) {
          const fileName=randomUUID()+'_'+Date.now()+'_'+file.originalname
          file.finalPath=bathePath+`/${fileName}`
          callback(null,fileName)},
      }),
      fileFilter(req:Request,file:Express.Multer.File,callback:Function){
        if (validation.includes(file.mimetype)) {
            return callback(null,true)
        }
        return callback (new BadRequestException('Invalid-Formate'))
      },
      limits:{
        fileSize:fileSize*1024*1024,

      }

    }
}