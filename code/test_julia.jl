
function isprime(n::Int)::Bool
    if n <= 1
        return false
    elseif n <= 3
        return true
    elseif n % 2 == 0 || n % 3 == 0
        return false
    end
    i = 5
    while i * i <= n
        if n % i == 0 || n % (i + 2) == 0
            return false
        end
        i += 6
    end
    return true
end


add(a::Int, b::Int) = a + b


struct TreeNode
    val::Int
    left::Union{TreeNode, Nothing}
    right::Union{TreeNode, Nothing}
end


TreeNode(val::Int) = TreeNode(val, nothing, nothing)


function count_nodes(root::Union{TreeNode, Nothing})::Int
    root === nothing && return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)
end


function inorder(root::Union{TreeNode, Nothing})
    result = Int[]
    function _traverse(node)
        node === nothing && return
        _traverse(node.left)
        push!(result, node.val)
        _traverse(node.right)
    end
    _traverse(root)
    return result
end

using Test


"""
    add_edge!(g, u, v)

Add an undirected edge between `u` and `v` in the adjacency-list graph `g`.
Creates the entry if it doesn’t yet exist.
"""
function add_edge!(g::Dict{Int, Vector{Int}}, u::Int, v::Int)
    push!(get!(g, u, Int[]), v)
    push!(get!(g, v, Int[]), u)
    return g
end



"""
    bfs(g, start)

Return the order in which nodes are visited by a standard BFS
starting from `start`.
"""
function bfs(g::Dict{Int, Vector{Int}}, start::Int)
    visited = Set{Int}()
    order   = Int[]
    queue   = [start]
    push!(visited, start)

    while !isempty(queue)
        u = popfirst!(queue)
        push!(order, u)
        for v in g[u]
            if v ∉ visited
                push!(visited, v)
                push!(queue, v)
            end
        end
    end

    return order
end


"""
    dfs(g, start)

Return the order in which nodes are visited by a standard recursive DFS
starting from `start`.
"""
function dfs(g::Dict{Int, Vector{Int}}, start::Int)
    visited = Set{Int}()
    order   = Int[]
    _dfs!(g, start, visited, order)
    return order
end

function _dfs!(g, u, visited::Set{Int}, order::Vector{Int})
    push!(visited, u)
    push!(order, u)
    for v in g[u]
        if v ∉ visited
            _dfs!(g, v, visited, order)
        end
    end
end



g1 = Dict{Int, Vector{Int}}()
add_edge!(g1, 1, 2)
add_edge!(g1, 2, 3)
add_edge!(g1, 3, 1)

@test sort(bfs(g1, 1)) == [1, 2, 3]    # BFS reaches all three
@test sort(dfs(g1, 1)) == [1, 2, 3]    # DFS too

g2 = Dict{Int, Vector{Int}}()
for (u,v) in ((1,2), (1,3), (3,4), (3,5))
    add_edge!(g2, u, v)
end

@test bfs(g2, 1) == [1, 2, 3, 4, 5]
@test Set(dfs(g2, 1)) == Set([1, 2, 3, 4, 5])




# ====== Tests ======
using Test

# prime tests
@test isprime(2) == true
@test isprime(4) == false
@test isprime(17) == true

# adder tests
@test add(3, 4) == 7

# tree tests
root = TreeNode(5)
root.left = TreeNode(3)
root.right = TreeNode(7)
root.left.left = TreeNode(2)
root.left.right = TreeNode(4)

@test count_nodes(root) == 5
@test inorder(root) == [2,3,4,5,7]

println(" Julia binary‐tree tests passed")
