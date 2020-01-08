//naive implementation of a double linked list to use as local database for made matches
//TODO: Match DB should be using a _real_ database, mongo, sql, amazon simpleDB even a hash table could be "better"

//a matchNode constains the two requests that were made and match
class MatchNode {
    constructor(p1, p2) {
        this.data = {};
        this.data.player1Request = p1;
        this.data.player2Request = p2;
        this.next = null;
        this.previous = null;
    }

    
    matchPlayer(playerID) {
        return (this.data.player1Request.id == playerID || this.data.player2Request.id == playerID);
    }

    ToString() {
        return "Match:" + JSON.stringify(this.data);
    }
}


class MatchDB {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    Append(node) {
        node.previous = null;
        node.next = null;

        // If there is no head yet  make new node a head.
        if (!this.head) {
            this.head = node;
            this.tail = node;

            return this;
        }

        // Attach new node to the end of linked list.
        this.tail.next = node;

        // Attach current tail to the new node's previous reference.
        node.previous = this.tail;

        // Set new node to be the tail of linked list.
        this.tail = node;

        return node;
    }


    //add a match to the database
    AddMatch(request1, request2)
    {
        let node = new MatchNode(request1, request2);

        this.Append(node);

        return node;
    }

    CheckForMatch(playerID) {
        let currentNode = this.head;
        while (currentNode) {
            if (currentNode.matchPlayer(playerID))
                return currentNode;
            currentNode = currentNode.next;
        }
        return null;
    }

    RemoveMatch(playerID) {

        let deletedNode = null;
        let currentNode = this.head;

        if (!this.head) {
            return null; // TODO: Throw error, should not be removing match that doesn't exist
        }

        if (this.head.matchPlayer(playerID)){
            deletedNode = this.head;
            this.head = this.head.next;

            // Set new head's previous to null.
            if (this.head) {
                this.head.previous = null;
            }
            else {
                this.tail = null;
            }
            currentNode = null; // shortcuts while loop below
        }
        else
        if (this.tail.matchPlayer(playerID)){
            deletedNode = this.tail;
            this.tail = this.tail.previous;
            this.tail.next = null;
            currentNode = null; // shortcuts while loop below
        }

        while (currentNode) {
            if (currentNode.matchPlayer(playerID)) {
                deletedNode = currentNode;

                if (deletedNode === this.tail) {
                    // If TAIL is going to be deleted...

                    // Set tail to second last node, which will become new tail.
                    this.tail = deletedNode.previous;
                    this.tail.next = null;
                } else {
                    // If MIDDLE node is going to be deleted...
                    const previousNode = deletedNode.previous;
                    const nextNode = deletedNode.next;

                    previousNode.next = nextNode;
                    nextNode.previous = previousNode;
                }
                break; // only one match per player allowed in "DB"
            }

            currentNode = currentNode.next;
        }

        deletedNode.previous = null;
        deletedNode.next = null;

        return deletedNode;
    }

    

    ToString() {
        let currentNode = this.head;
        let theString = "";
        while (currentNode) {
            theString = theString + currentNode.ToString() + "\n";
            currentNode = currentNode.next;
        }
        return theString;
    }
}

module.exports.MatchDB = MatchDB;

module.exports.MatchNode = MatchNode;
 