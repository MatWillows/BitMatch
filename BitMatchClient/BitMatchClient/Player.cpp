#include<stdio.h>
#include<stdlib.h>

#include"player.h"

using namespace std;


	
int player::GetNewPlayerID()
{	
	static int nextID = 0;

	return nextID += 1;
}

player::player()
{
	m_ID = player::GetNewPlayerID();
	m_powerLevel = rand() % 30; //assign a random power level to player
	m_wins = 0;
	m_losses = 0;
}

string player::ToString()
{
	string myString = "";
	myString = " ID:" + to_string(m_ID) + " PPL:" + to_string(m_powerLevel) + " Wins:" + to_string(m_wins) + " Losses:" + to_string(m_losses);
		
	return myString;
}

