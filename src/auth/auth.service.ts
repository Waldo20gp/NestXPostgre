import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { DBHandlerError } from '../common/db/dbErrors.helper'

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private dbHandlerError: DBHandlerError,

    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const {password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10 )
      });

      await this.userRepository.save( user );
      delete user.password;

      return { 
        ...user,
        token: this.getJwtToken({
          id: user.id,
          email: user.email
        })
      }
    } catch (error) {
      this.dbHandlerError.handleDBExceptions(error,'Auth-service')
    }
  }

  async login(loginUserDto:LoginUserDto){
      
    const { password, email} = loginUserDto;
    
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: { email: true, password:true, id:true }
     });
    
    if(!user){
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if( !bcrypt.compareSync( password, user.password )){
      throw new UnauthorizedException('Credentials are not valid (password)');
    }


    return { 
      ...user,
      token: this.getJwtToken({id:user.id,
                              email:user.email})
    }
    
  }



  private getJwtToken ( payload: JwtPayload){
    const token = this.jwtService.sign( payload );
    return token;
  }

}
