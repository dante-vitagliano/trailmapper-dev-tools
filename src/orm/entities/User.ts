import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Unique } from "typeorm";

@Entity("user")
@Unique('auth0_sub_uk', ['auth0id'])
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    auth0id: string;

    @UpdateDateColumn()
    last_updated: Date;
    
}