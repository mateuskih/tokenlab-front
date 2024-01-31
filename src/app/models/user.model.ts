import { EventModel } from "./event.model";
import { InvitationModel } from "./invitation.model";

export interface UserModel {
    id: number;
    username: string;
    password: string;
    events: EventModel[];
    invitations: InvitationModel[];
}
