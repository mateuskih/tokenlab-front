import { InvitationModel } from "./invitation.model";
import { UserModel } from "./user.model";


export interface EventModel {
    id: number;
    description: string;
    startTime: Date;
    endTime: Date;
    user: UserModel;
    invitations: InvitationModel[];
  }