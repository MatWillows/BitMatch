// BitMatchClient.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include <conio.h>

#include "client.h"
#include "API.h"

#define NUM_CLIENTS 20


int main()
{
    shared_ptr<API> api = make_shared<API>();
    
    std::cout << "starting Client test\n";

    std::shared_ptr<Client> clients[NUM_CLIENTS];

    //create some clients
    for (int n = 0; n < NUM_CLIENTS; n++)
    {
        clients[n] = std::make_shared<Client>();
    }

    //simple update loop
    bool looping = true;
    int tickCount = 0;
    while (looping)
    {
        
        for (int n = 0; n < NUM_CLIENTS; n++)
        {
            clients[n]->Update(tickCount);
        }

        std::cout << "time: " + to_string(tickCount) + "\nY to continue, S for status)\n";
        int response = _getch();
        if (tolower(response) == 's')
        {
            std::cout << api->GetStatus() << endl;
        }
        else
        if (tolower(response) == 'y')
        {
            
        }
        else
        {
            looping = false;
        }
        tickCount++;
    }


}



