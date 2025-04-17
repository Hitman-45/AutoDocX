#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

class Graph {
    unordered_map<int, vector<int>> adjList;

public:
    void addEdge(int u, int v) {
        adjList[u].push_back(v);
    }

    void printGraph() {
        for (auto& [u, neighbors] : adjList) {
            cout << u << ": ";
            for (int v : neighbors)
                cout << v << " ";
            cout << endl;
        }
    }

    bool hasEdge(int u, int v) {
        for (int neighbor : adjList[u]) {
            if (neighbor == v)
                return true;
        }
        return false;
    }
};
