/**
 * This is type safe interface for incoming friend request
 */
interface IncomingFriendRequests {
   senderId: string;
   senderEmail: string | null | undefined;
}
