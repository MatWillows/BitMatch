#pragma once
#include<string>

class player
{
private:
	static int nextID;
	
public: //we're just prototyping so leaveing members as public for easy reference;
	int m_ID;
	int m_powerLevel;
	int m_wins;
	int m_losses;

	static int GetNewPlayerID();
	
	player();
	
	std::string ToString();

};

