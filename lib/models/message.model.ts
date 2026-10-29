import {Attachment, MessageStatus, UserId} from "@/lib/types/types";

export class MessageModel {
    id: string | null = null;                    // строкой, чтобы подходил и временный clientId
    clientId?: string;             // id, который придумал браузер при отправке: по нему своё неотправленное сообщение находит сохранённую копию
    text: string | null = null;
    sentAt: string | null = null;
    author: { id: UserId  | null; name: string | null; color: string | null } = {id: null, name: null, color: null};
    isMine: boolean = false;
    status?: MessageStatus;        // только у своих сообщений
    attachment?: Attachment;

    constructor(data?: Partial<MessageModel>) {
        Object.assign(this, data);
    }
}