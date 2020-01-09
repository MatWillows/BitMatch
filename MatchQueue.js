
const q = require('./Queue.js');
const db = require('./MatchDB.js');


//match request is the structure for a match
//contains the id of the requester, their power level, the time it was created,  whether the player has accepted a match, and a data block
//data block can be anything the client needs to push, particularly peer to peer connection information
class MatchRequest {
    constructor(playerID, ppl, time, accepted, data) {
        this.id = playerID,
        this.ppl = ppl;
        this.time = time;
        this.accepted = accepted;
        this.data = data;
    }

    //get the time since the matchrequest was created
    getDeltaTime() {
        let d = new Date();
        let time = d.getTime();
        return (time - this.time) / 1000;
    }

    ToString() {
        return JSON.stringify(this);
    }
}

function createMatchRequest(playerID, ppl, data = null) {
    //assign creation time
    let d = new Date();
    let time = d.getTime();
    return new MatchRequest(playerID,  ppl, time,  false, data); //when created a match request is not accepted
}

//TODO: Move this to its own file
//the queue manager contains the array of queues that contain matches as well as the database of matches
class MatchManager {
    constructor(range = 5, timeoutlength = 120, rangeWidenTime = 10) {
        this.queues = [];         //simple array of queueus
        this.matchDB = new db.MatchDB(); // the database containing made matches
        this.oldMatches = new db.MatchDB();  // archive of old matches just for initial testing implementation

        //range is the band length of the PPL range contained in each queue, default to a range of 5
        this.queueRange = range;

        //timeout length is how long to keep searching before givin up in seconds
        this.timeoutlength = timeoutlength;

        //rangeWidenTime is the amount of time to widen the search +/1 one queue band in seconds
        this.rangeWidenTime = rangeWidenTime;
    }

    getPPLRange(ppl) {
        return Math.floor(ppl / this.queueRange); //TODO: create a lookup table such that we can map a given ppl to a queue number instead of naively dividing by range
    }

    //get a queue of a given ppl
    getQueue(qn) {

        //check to see if the appropriate queue exists, if not extend the queues to contain the reuqested ranges
        //TODO: adjust to contain variable length ranges, i.e. pre-create queues and assign them ranges
        while (this.queues.length <= qn) {
            let queue = new q.Queue();
            this.queues.push(queue);
        }

        return this.queues[qn];
    }

    //the workhorse function
    //takes playerID and powerlevel
    //returns a matchrequest (if no match is found) or a match (if a match is found) or timeout
    getMatch(id, ppl, data) {

        //check to see if there's a match in the database
        let theMatch = this.matchDB.CheckForMatch(id);

        //we have a match!
        if (theMatch) {

            //player 1 always accepts the match when its created
            //check to see if we're player2, and if so accept the match
            if (theMatch.data.player2Request.id == id)
            {
                theMatch.data.player2Request.accepted = true;
            }

            //if both players accept the match, remove it from the mainDB, and archive it
            if (theMatch.data.player2Request.accepted && theMatch.data.player1Request.accepted) {
                theMatch.data.status = "bothaccepted";
                this.matchDB.RemoveMatch(id);
                this.oldMatches.Append(theMatch);
            }

            return theMatch.data;
        }

        //find the appropriate base queue
        let qn = this.getPPLRange(ppl); //saving to use later if we need to widen band of searching
        let queue = this.getQueue(qn);

        let mRequest = null;

        //if the queue is empty add the match request
        if (queue.isEmpty()) {
            mRequest = createMatchRequest(id, ppl, data);
            queue.enqueue(mRequest);
            return mRequest;
        }

        //there is something on the queue
        mRequest = queue.peek();

        if (mRequest.id == id) {
            //we're at the top of the queue
            let deltaTime = mRequest.getDeltaTime();

            //check for timeoutfirst
            if (deltaTime > this.timeoutlength) {
                //remove the match request and return timeout
                queue.dequeue(); //GC will remove the actual element eventually
                console.log('Time out match id: ' + id.toString() + ' with ppl:' + ppl.toString());
                return 'Time Out';
            }

            //check if we need to widen the search, if not return the match
            //technically redundant with the while loop
            if (deltaTime < this.rangeWidenTime) {
                console.log('Match not yet found: ' + id.toString() + ' with ppl:' + ppl.toString());
                return mRequest;
            }

            //start widening the search
            let searchWidth = Math.floor(deltaTime / this.rangeWidenTime );
            let offset = 1;
            let queueWidened = null
            let matchFound = false;
            
            while (Math.abs(offset) <= searchWidth) {
                //TODO: perhaps randomly choose searching up or down
                //check up
                queueWidened = this.getQueue(qn + offset)
                {
                    //if we find a match, remove the match from original queue
                    if (queueWidened.peek()) {
                        queue.dequeue();
                        queue = queueWidened;
                        matchFound = true;
                        break;
                    }
                }
                //check down
                if (qn - offset > 0) {
                    queueWidened = this.getQueue(qn - offset)
                    {
                        //if we find a match, remove the match from original queue
                        if (queueWidened.peek()) {
                            queue.dequeue();
                            queue = queueWidened;
                            matchFound = true;
                            break;
                        }
                    }
                }
                //no match found yet, increase search range
                offset = offset + 1;
            }

            if (!matchFound) {
                console.log('Match not yet found for: ' + id.toString() + ' with ppl:' + ppl.toString() + ' at searchwidth ' + searchWidth.toString());
                return mRequest;
            }
            else {
                console.log('Widened Match found for: ' + id.toString() + ' with ppl:' + ppl.toString() + ' at searchwidth ' + searchWidth.toString());
            }

        }

        //wefound a match!
        //queue is the queue containing the match (it might be the original, or have been widened due to time)
        let player1Match = null;

        let player2Match = null;

        //if we were already in the system, (repeat request) the match id will match us
        //since we found the match first, we will be player1

        if (mRequest.id == id) {
            player1Match = mRequest;
            player2Match = queue.dequeue();
        }
        else
        {
            //otherwise create a new match request
            player1Match = createMatchRequest(id, ppl, data);
            player2Match = mRequest;
            queue.dequeue(); // remove old request
        }

        //player1 has accepeted (found) the match
        player1Match.accepted = true;

        //add the match to the match database
        theMatch = this.matchDB.AddMatch(player1Match, player2Match);

        return theMatch.data;
    }

    ToString() {
        let status = "num queues = " + this.queues.length.toString() + "\n ";
        let n = 0;
        for (n = 0; n < this.queues.length; n++)
        {
            status = status + "queue[" + n.toString() + "] = " + this.queues[n].ToString() + "\n";
        }

        status = status + "Matches: " + this.matchDB.ToString()+ "\n";
        status = status + "OldMatches: " + this.oldMatches.ToString() + "\n";

        return status;
    }

}

function createManager() {
    return new MatchManager();
}

module.exports.MatchRequest = MatchRequest;
module.exports.createManager = createManager;
module.exports.createMatchRequest = createMatchRequest;
module.exports.MatchManager = MatchManager;