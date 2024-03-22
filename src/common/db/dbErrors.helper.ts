import { BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";


export class DBHandlerError{
    private readonly logger = new Logger('ProductsService');
    
    constructor(){}

    handleDBExceptions (error : any, module:string): never{
        if ( error.code  === '23505') throw new BadRequestException(error.detail);
    
          this.logger.error(error)
          throw new InternalServerErrorException('Error en el servidor inesperado, llama al equipo de backend')
    }

}