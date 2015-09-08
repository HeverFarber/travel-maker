var express = require('express');
var app = express();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');
var async = require('async');
var Heap = require('heap');

mongoose.connect('mongodb://localhost/travel');

var site = new Schema({
    name: String,
    location: Schema.Types.Mixed,
    time: String
});

var track = mongoose.model('Track', {
    title: String,
    sites: [site]
});

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(express.static('client'));
app.use("/node_modules", express.static('node_modules'));


app.get('/track', function (req, res) {
    track.find({}, function (err, results) {
        res.json(results);
    });
});

app.post('/track', function (req, res) {
    track.remove({}, function (err, results) {
        track.collection.insert(req.body.tracks, function () {
            res.send("ok");
        });
    });
});

// This is a constant factor approximation algorithm with a factor of 2
// sites: [{x:1234,y:7632},{x:1234,y:763}...]
function TSP(sites, cb) {
    async.waterfall([
        function (callback) {

            var Edges = [];

            // retrive cost between nodes
            for (var iNode = 0; iNode < sites.length; iNode++) {

                // add Identifier to site
                sites[iNode].id = iNode;
                for (var jNode = iNode + 1; jNode < sites.length; jNode++) {
                    var u = sites[iNode],
                        v = sites[jNode];

                    // add Identifier to site
                    v.id = jNode;

                    Edges.push({
                        u: u,
                        v: v
                    });
                }
            }

            async.each(Edges, function (edge, callback) {
                    getCost(edge.u, edge.v, function (cost) {
                        edge.cost = cost;

                        callback();
                    });
                },
                function (err, result) {
                    callback(null, Edges);
                });
        },
        function (Edges, callback) {
            // sort the edges
            Edges.sort(function (a, b) {
                return a.cost - b.cost;
            });

            callback(null, Edges);
        },
        function (Edges, callback) {
            // build Minimum spanning tree
            var Graph = {};

            Edges.forEach(function (obj) {
                console.log(obj.u.id + " -> " + obj.v.id + " cost:" + obj.cost)
            });

            function search(Graph, start, target) {
                var UNIQE = {},
                    stack = [];

                UNIQE[start] = true;
                stack.push(start);

                while (stack.length != 0) {
                    var headStack = stack[stack.length - 1];
                    paths.push(headStack);
                    var toReturn = true;

                    for (var i = 0; i < Graph[headStack].links.length; i++) {
                        var link = Graph[headStack].links[i].id;

                        if (!UNIQE[link]) {
                            UNIQE[link] = true;
                            stack.push(link);
                            toReturn = false;
                            break;
                        }
                    }

                    if (toReturn)
                        stack.pop();
                }

                return true;
            }

            Edges.forEach(function (edge) {
                if (!(Graph[edge.u.id] && Graph[edge.v.id])) {
                    // add to graph new node in case this nodes not exists
                    Graph[edge.u.id] = (Graph[edge.u.id]) ? Graph[edge.u.id] : {
                        links: []
                    };
                    Graph[edge.v.id] = (Graph[edge.v.id]) ? Graph[edge.v.id] : {
                        links: []
                    };

                    // add link of spanning tree
                    Graph[edge.u.id].links.push({
                        node: Graph[edge.v.id],
                        id: edge.v.id,
                        cost: edge.cost
                    });
                    Graph[edge.v.id].links.push({
                        node: Graph[edge.u.id],
                        id: edge.u.id,
                        cost: edge.cost
                    });
                }
            });

            callback(null, Graph);
        },
        function (Graph, callback) {
            // run deep search

            // init the paths and uniqe node
            var random = Math.floor(Math.random() * Object.keys(Graph).length),
                UNIQE = {},
                paths = [],
                stack = [];

            UNIQE[random] = true;
            stack.push(random);

            while (stack.length != 0) {
                var headStack = stack[stack.length - 1];
                paths.push(headStack);
                var toReturn = true;

                for (var i = 0; i < Graph[headStack].links.length; i++) {
                    var link = Graph[headStack].links[i].id;

                    if (!UNIQE[link]) {
                        UNIQE[link] = true;
                        stack.push(link);
                        toReturn = false;
                        break;
                    }
                }

                if (toReturn)
                    stack.pop();
            }

            callback(null, paths);
        },
        function (paths, callback) {

        }
    ], cb);

}

// site is {x:1234,y:7632}
function getCost(u, v, cb) {
    cb(Math.floor(Math.random() * 1000));
}

function DFS(Graph, start, target) {
    
    // init the paths and uniqe node
    var UNIQE = {},
        paths = [],
        stack = new Stack();

    UNIQE[start] = true;
    stack.push(start);

    while (!stack.isEmpty()) {
        paths.push(stack.head());
        var back = true;

        for (var i = 0; i < Graph[stack.head())].links.length; i++) {
            var link = Graph[stack.head())].links[i].id;

            if (!UNIQE[link]) {
                UNIQE[link] = true;
                stack.push(link);
                back = false;
                break;
            }
        }

        if (back)
            stack.pop();
    }
    
    return paths;
}

var Stack = function (){
    var stack = [];
    
    this.isEmpty = function (){
        return stack.length == 0;
    };
    
    this.head = function (){
        return (this.isEmpty()) ? undefined : stack[stack.length - 1];
    };
    
    this.pop = function (){
        return stack.pop();
    };
    
    this.push = function (item){
        stack.push(item);  
    };
};

var temp = [{
    x: 1234,
    y: 1234
}, {
    x: 1234,
    y: 1234
}, {
    x: 1234,
    y: 1234
}, {
    x: 1234,
    y: 1234
}, {
    x: 1234,
    y: 1234
}];

TSP(temp, function (result) {

});

var server = app.listen(9000, function () {
    console.log('listening at 9000');
});