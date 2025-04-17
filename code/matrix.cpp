#include <iostream>
#include <vector>

using namespace std;

void printMatrix(const vector<vector<int>>& mat) {
    for (auto& row : mat) {
        for (int val : row) {
            cout << val << " ";
        }
        cout << endl;
    }
}

vector<vector<int>> transposeMatrix(const vector<vector<int>>& mat) {
    int rows = mat.size();
    int cols = mat[0].size();
    vector<vector<int>> trans(cols, vector<int>(rows));

    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j)
            trans[j][i] = mat[i][j];
    return trans;
}
