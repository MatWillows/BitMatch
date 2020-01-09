#include "API.h"
#include"cpr/cpr.h"
#include <iostream>

 API *API::Instance = nullptr;

string API::RequestMatch(int playerID, int powerLevel, string data)
{
	//primitive JSON encoding for request
	string body = "{ \"playerID\": " + to_string(playerID) + ", \"ppl\":" + to_string(powerLevel) + ", \"data\" : \"" + data + "\"}";
	
	auto r = cpr::Put(cpr::Url{ "http://localhost:3000/api/requestMatch" },
		cpr::Body{ body },
		cpr::Header{ {"Content-Type", "application/json"} });
	
	//need to parse the text here
	string result = r.text;
	return result;
}

string API::GetStatus()
{
	auto r = cpr::Get(cpr::Url{ "http://localhost:3000/api/status" });
	return r.text;
}
