#include "Client.h"

#include <iostream>
#include <time.h>
#include "API.h"
#include <random>


Client::Client()
{
	m_player = make_shared<player>();
	
	m_lastUpdate = 0;
	m_nextUpdate = 0;
	m_pollTime = POLL_TIME;
	m_idleTime = IDLE_TIME;
	m_state = gamestate::INIT;
	m_opponent = nullptr;

	m_data = to_string(m_player->m_ID);
}

string Client::RequestMatch()
{
	//make www call here
	string matchResultResult = API::Instance->RequestMatch(m_player->m_ID, m_player->m_powerLevel, m_data);

	//process call
	return matchResultResult;
}

void Client::Update(int time)
{
	if (time > m_nextUpdate)
	{
		//should be wrapped in a more general state machine
		switch (m_state)
		{
		case INIT:
			Init(time);
			break;
		case WAITINGFORMATCH:
			WaitingForMatch(time);
			break;
		case BATTLING:
			Battling(time);
			break;
		case IDLE:
		default:
			Idle(time);
			break;
		}
	}
	else
	{
		std::cout << to_string(m_player->m_ID) + " waiting\n";
	}
}

void Client::Init(int time)
{

	std::cout << ToString();
	m_state = IDLE;
}

void Client::WaitingForMatch(long time)
{
	
	

	string matchRequestResult = RequestMatch();

	if (matchRequestResult.find("Time Out") != string::npos)
	{
		m_state = IDLE;
		std::cout << to_string(m_player->m_ID) + " Time Out\n";
		return;
	}
	else
	if (matchRequestResult.find("bothaccepted") != string::npos)
	{
		std::cout << to_string(m_player->m_ID) + " Match found\n";
		//set opponent
		//do battle
	}
	else
	{
		std::cout << to_string(m_player->m_ID) + " requesting Match\n";
	}
	
	m_nextUpdate = time + POLL_TIME;
	
}
	
void Client::Battling(long time)
{
	//use the match result to pass messages between clients, etc...

}

void Client::Idle(long time)
{
	
	int r = rand() % 100;
	//sometimes look for a match
	if (r < 50) 
	{
		m_state = WAITINGFORMATCH;
		WaitingForMatch(time);
	}
	
	else
	{
		str:cout << to_string(m_player->m_ID) + " idling\n";
		m_nextUpdate = time + IDLE_TIME;
	}
}


string Client::ToString()
{
	string myString = "";

	myString = "State:" + to_string(m_state) + "\n  Player: " + m_player->ToString();
	if (m_opponent)
	{
		myString += "\n  Opponent:" + to_string(m_opponent->m_player->m_ID);
	}

	return myString;
}
