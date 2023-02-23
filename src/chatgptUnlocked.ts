import * as dotenv from 'dotenv';
dotenv.config();

type SendMessageProps = {
    conversationId?: string;
    parentMessageId?: string;
    server?: number;
    user?: string;
}

const SERVER_PORT_MAP: any = {
    1: 5001, 2: 5002,
    3: 5003, 4: 5004,
    5: 5005, 6: 5006,
    7: 5007, 8: 5008,
    9: 5009, 10: 5010,
}

export default class ChatGPTUnlockedAPI {

    async sendMessage (message: string, { 
        conversationId, 
        parentMessageId, 
        server,
        user,
    }: SendMessageProps) {

        const obj = {
            apiKey: process.env.CHATGPT_UNLOCKED_KEY!,
            prompt: message,
            conversationId: conversationId,
            parentMessageId: parentMessageId,
            expectedUser: user,
        }
        
        if (!server) server = Math.floor(Math.random() * Object.keys(SERVER_PORT_MAP).length) + 1;
        const port = SERVER_PORT_MAP[server] ?? 5001;
        const url = process.env.CHATGPT_UNLOCKED_SERVER! + ':' + port;

        let response;
        try {
            response = await fetch(url + '/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            });

        } catch (e) {
            console.log(e);
            throw new Error('Cannot access ChatGPT Unlocked API');
        }

        const data = await response.json();

        if (!data.success)
            throw new Error(data.response);

        return {
            response: data.response.message,
            conversationId: data.response.conversationId,
            messageId: data.response.parentId,
            serverId: server,
            user: data.response.expectedUser,
        }

    }

}