#pragma once

#define CURL_STATICLIB

#include <curl\curl.h>
#include<string>

using namespace std;


typedef struct match_request
{
	int id;
	int ppl;
	long time;
	bool accepted;
	string data;

};


class API
{
public:
	static API* Instance; 
	CURL* curl;

	API()
	{
		Instance = this;
		curl = curl_easy_init();
	};

	~API()
	{
		curl_easy_cleanup(curl);
	};

	string GetStatus();

	string RequestMatch(int playerID, int powerLevel, string data);

};





