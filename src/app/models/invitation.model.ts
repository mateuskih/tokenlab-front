import { EventModel } from "./event.model";
import { UserModel } from "./user.model";

export enum ConviteStatusEnum {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
}
  
export interface InvitationModel {
    id: number;
    invitedUser: UserModel;
    event: EventModel;
    status: ConviteStatusEnum;
  }
