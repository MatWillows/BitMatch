#pragma once
#include "player.h"
#include <memory>
//represents a single client, mobile device, etc... one to one match with client and device

//times in ticks between polling for matches
#define POLL_TIME 5

//amount of ticks between idle updates
#define IDLE_TIME 2

using namespace std;

enum gamestate
{
	NONE,
	INIT,
	WAITINGFORMATCH,
	BATTLING,
	IDLE
};

class Client
{
private:
	long m_lastUpdate; //last time update was called
	long m_nextUpdate; //next time we should update
	long m_pollTime; //periodicy of polling time, should be in config or grabbed from server
	long m_idleTime;
	string m_data; // stub for connection infor, etc...

	//these should be wrapped in a re-usable state machine object
	void Init(int time);
	void WaitingForMatch(long time);
	void WaitingForOtherPlayer(long time);
	void Battling(long time);
	void Idle(long time);


public:
	gamestate m_state;
	shared_ptr<player> m_player;
	shared_ptr<Client> m_opponent;

	Client();

	string RequestMatch();

	void Update(int time);

	string ToString();

};





