'use strict';
// import blossom from './blossom';
/*
Example: (https://github.com/mattkrick/EdmondsBlossom/blob/master/spec/blossomSpec.js)
var data = [[1, 2, 5], [2, 3, 11], [3, 4, 5]];
var correctAnswer = [-1, 2, 1, 4, 3];
var result = blossom(data, true);
*/

//This is where you can change the details of the simulation
let simulations = 1000; //number of simulations
let simulation_results = []; //result for every simulation
let rounds = 7; //number of rounds
let round = 0; // current round
let points_win = 1;
let points_draw = 0.5;

function check_condition() {
    //function goes in here, so you don't have to look it up down there
    return measure_accuracy_of_places(undefined);
}

/* 
is_player_of_interest1_first()
second_didnt_play_1()
third_didnt_play_1_or_2()
player1_player2_final_top4(group)
is_player_of_interest1_in_top_n(1,4)
measure_accuracy_of_places(undefined)
*/

let player_of_interest_1 = 1
let player_of_interest_2 = 12
let player_of_interest_3 = 13

let draw_on_purpose = false;
let better_player_always_wins_equals_draw = true;
let randomize_round_1 = true;
let print_only_last_simulation = true;
let treat_bye_as_player = false; //for tiebreak calculation

let win_percentage_skillgap = [50, 60, 70, 85, 90, 95, 98, 98, 100]

let player_list = [
    { id: 1, group: 0, skill: 30, games: [], name: "Julia" },
    { id: 12, group: 0, skill: 27, games: [], name: "Christian" },
    { id: 13, group: 0, skill: 26, games: [], name: "Reinhard" },
    { id: 14, group: 0, skill: 26, games: [], name: "PeterD" },
    { id: 15, group: 0, skill: 20, games: [], name: "GerhardF" },
    { id: 16, group: 0, skill: 20, games: [], name: "GerhardL" },
    { id: 17, group: 0, skill: 22, games: [], name: "Srdjan" },
    { id: 18, group: 0, skill: 20, games: [], name: "PeterR" },
    { id: 19, group: 1, skill: 22, games: [], name: "Clemens" },
    { id: 20, group: 1, skill: 18, games: [], name: "Johannes" },
    { id: 21, group: 1, skill: 18, games: [], name: "MichaelE" },
    { id: 22, group: 1, skill: 19, games: [], name: "Gergley" },
    { id: 23, group: 1, skill: 18, games: [], name: "Gernot" },
    { id: 24, group: 1, skill: 18, games: [], name: "Fabian" },
    { id: 25, group: 1, skill: 17, games: [], name: "Stephan" },
    { id: 26, group: 1, skill: 18, games: [], name: "MichaelR" },
    { id: 27, group: 1, skill: 16, games: [], name: "Aleyna" },
    { id: 28, group: 1, skill: 22, games: [], name: "Alexander" },
    { id: 29, group: 1, skill: 22, games: [], name: "Markus" }
]



//functions
function calc_score(player, rounds) {
    let sum = 0;
    // if rounds is undefined, sum score of all games
    if (rounds === undefined || rounds > player.games.length) {
        rounds = player.games.length;
    }
    for (let i = 0; i < rounds; i++) {
        sum += player.games[i].result;
    }
    return sum;
}

function calc_final_score(player, rounds) {
    let games = player.games;
    if (rounds) {
        games.slice(0, rounds);
    }
    let opponent_scores = [];
    let opponent_opponent_scores = [];
    for (let game of games) {
        if (game.opponent.id !== -1) {
            let opponent = game.opponent
            opponent_scores.push(calc_score(opponent, rounds));
            for (let opgame of opponent.games) {
                if (opgame.opponent.id !== -1) {
                    let op_opponent = opgame.opponent
                    opponent_opponent_scores.push(calc_score(op_opponent, rounds));
                } else if (treat_bye_as_player) {
                    opponent_opponent_scores.push(0);
                }
            }
        } else if (treat_bye_as_player) {
            opponent_scores.push(0);
        }
    }
    //console.log(player_list)
    //console.log(player)
    //console.log(opponent_scores)
    //console.log(opponent_opponent_scores)
    let sum1 = 0;
    for (let i = 0; i < opponent_scores.length; i++) {
        sum1 += opponent_scores[i];
    }
    let opponent_average = (sum1 / opponent_scores.length * 100).toFixed(1)

    let sum2 = 0;
    for (let i = 0; i < opponent_opponent_scores.length; i++) {
        sum2 += opponent_opponent_scores[i];
    }
    let op_opponent_average = (sum2 / opponent_opponent_scores.length * 100).toFixed(1)

    let final_score = parseInt(calc_score(player, rounds) * 10000000) + parseInt(opponent_average * 1000) + parseInt(op_opponent_average)
    //console.log(opponent_average);
    //console.log(op_opponent_average);
    //console.log(final_score)
    return final_score
}

function sort_players_skill(group_id) { //sorts players, only subgroup if specified)
    let sorted = player_list;
    if (group_id) {
        sorted = sorted.filter(x => x.group === group_id);
    }
    return sorted
        .map(player => ({
            id: player.id,
            name: player.name,
            score: player.skill
        })
        )
        .sort((a, b) => (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0);
}

function sort_players(group_id, rounds) { //sorts players, only subgroup if specified, only up until round if specified)
    let sorted = player_list;
    if (group_id) {
        sorted = sorted.filter(x => x.group === group_id);
    }
    return sorted
        .map(player => ({
            id: player.id,
            name: player.name,
            score: calc_score(player, rounds)
        })
        )
        .sort((a, b) => (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0);
}

function sort_players_final_score(group_id, rounds) { //sorts players, only subgroup if specified, only up until round if specified)
    let sorted = player_list;
    if (group_id) {
        sorted = sorted.filter(x => x.group === group_id);
    }
    return sorted
        .map(player => ({
            id: player.id,
            name: player.name,
            score: calc_final_score(player, rounds)
        })
        )
        .sort((a, b) => (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0);
}

function get_players_on_place_n(sorted_list, n){
    let score = sorted_list[n-1].score
    let place_n = []
    for (let player of sorted_list){
    if(score === player.score){place_n.push(player_list.find(obj => obj.id === player.id))}
    }
    return place_n
}

function get_places_of_player_id(sorted_list, player_id){
    let score = sorted_list.find(obj => obj.id === player_id).score;
    let places = []
    for (let i = 0; i < sorted_list.length; i++){
    if(score === sorted_list[i].score){places.push(i+1)}
    }
    return places
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generate_buckets() {
    let buckets = {};
    for (const player of player_list) {
        let score = calc_score(player, undefined);
        if (score in buckets) {
            buckets[score].push(player);
        } else {
            buckets[score] = [player];
        }
    }

    if (round > 1 || (round === 1 && randomize_round_1)) {
        for (const key of Object.keys(buckets)) {
            shuffleArray(buckets[key]);
        }
    }

    // if ((player_list.length % 2) === 1) {
    //     buckets['-1'] = [{ id: -1, skill: 0, games: [], name: 'bye' }];
    // }

    return buckets;
}

function find_opponent(player, vs) {
    for (let i = 0; i < vs.length; i++) {
        if (vs[i].games.some(game => game.opponent.id === player.id) === false) {
            return i;
        }
    }
    return -1;
}

function determine_result(player1, player2) { //returns 0, 1 or 0.5
    if (player2.name === "bye") { return 1; }
    if (better_player_always_wins_equals_draw && player1.skill === player2.skill) {return points_draw};
    if (!(better_player_always_wins_equals_draw)&&determine_draw(player1, player2)) { return points_draw; }
    let skill_gap = Math.abs(player1.skill - player2.skill);
    // skill_gap is 0 -> first entry, skill_gap >= array length -> 100
    let win_perc = win_percentage_skillgap[skill_gap] ?? 100;
    if (better_player_always_wins_equals_draw) {win_perc = player1.skill === player2.skill ? 50 : 100}
    if (player1.skill < player2.skill) { win_perc = 100 - win_perc; }
    return (determine_win(win_perc)) ? points_win : 0;
}

function determine_win(win_perc) {
    let random = Math.floor(Math.random() * 100); //0 to 99
    return random < win_perc //e.g. 100 is always bigger, for 90 there is 0,...,89
}

function determine_draw(player1, player2) {
    //higher skill makes draw more likely
    let skill_average = (player1.skill + player2.skill) / 2;
    let skill_gap = Math.abs(player1.skill - player2.skill);
    let no_draw_perc;
    if (skill_average > 24 && skill_gap < 5) { no_draw_perc = 82 + 4 * skill_gap; } else { no_draw_perc = 100; }
    let random = Math.floor(Math.random() * 100); //0 to 99
    return random > no_draw_perc;
}

function check_percent(sim_results) {
    let trueCount = sim_results.filter((value) => value === true).length;
    let totalCount = sim_results.length;
    let truePercentage = (trueCount / totalCount) * 100;
    let roundedPercentage = truePercentage.toFixed(2);
    console.log(roundedPercentage + '% (' + trueCount + '/' + totalCount + ')');
}

function opponents_lost_to(player) {
    //returns opponents the player lost against
    let op_lost_to = [];
    for (let game of player.games) {
        if (game.result === 0) { op_lost_to.push(game.opponent) }
    }
    return op_lost_to
}

function calc_average_score(players) {
    //returns average score of playerlist
    if (players === []) { return -1 };
    let sum = 0;sort_players_final_score
    for (player of players) {
        sum = parseInt(sum + calc_score(player));
    }
    let average = (sum / players.length).toFixed(2);
    return average;
}

//##### Check functions

function is_player_of_interest1_first(group) {
    if (print_gate) { console.log(`Spieler von Interesse: ${player_list[player_of_interest_1 - 1].name} und Gewinner: ${sort_players_final_score(group, rounds)[0].name}`) }
    return (player_list[player_of_interest_1 - 1].id === sort_players_final_score(group, rounds)[0].id)
}

function is_player_of_interest1_n_th(group, x) {
    if (print_gate) { console.log(`Spieler von Interesse: ${player_list[player_of_interest_1 - 1].name} und ${x}-ter Platz: ${sort_players_final_score(group, rounds)[x].name}`) }
    return (player_list[player_of_interest_1 - 1].id === sort_players_final_score(group, rounds)[x - 1].id)
}

function is_player_of_interest1_in_top_n(group, x) {
    let sorted_players = sort_players_final_score(group, rounds);
    let poi_1 = player_list[player_of_interest_1 - 1];
    if (print_gate) {
        let index
        for (let i = 0; i < sorted_players.length; i++) {
            if (sorted_players[i].id === poi_1.id) {
                index = i;
                break;
            }
        }
        console.log(`Spieler von Interesse: ${player_list[player_of_interest_1 - 1].name} und Platz: ${[index + 1]}`)
    }
    for (let i = 0; i < x; i++) {
        if (player_list[player_of_interest_1 - 1].id === sorted_players[i].id) { return true }
    }
    return false
}

function second_didnt_play_1(group) {
    //second player of group didn't get the chance to play firt player OR won
    let p1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let p2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    if (print_gate) {
        let output = [];
        for (let game of p2.games) {
            output.push(game.opponent.name)
        }
        console.log(`First: ${p1.name}`)
        console.log(`Second: ${p2.name}`)
        console.log(`Opponents: ${output}`)
    }
    //if (calc_score(p1, rounds)>calc_score(p2, rounds)){return false}
    for (let game of p2.games) {
        if (game.opponent.name === p1.name && !(game.result === 1)) { return false }
    }
    return true
}

function third_didnt_play_1_or_2(group) {
    //third player of group didn't play against first and second OR won
    let p1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let p2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    let p3 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[2].id);

    if (print_gate) {
        let output = [];
        for (let opponent of opponents_lost_to(p3)) {
            output.push(opponent.name)
        }
        console.log(`First: ${p1.name} Second: ${p2.name}`)
        console.log(`Third: ${p3.name}`)
        console.log(`Opponents lost to: ${output}`)
    }
    for (let game of p3.games) {
        if (game.opponent.name === p1.name && !(game.result === 1)) { return false }
        if (game.opponent.name === p2.name && !(game.result === 1)) { return false }
    }
    return true
}

function player1_player2_final_top4(group) {
    //checks if player 1 and 2 can face off in final, when there is top 4
    let place_1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let place_2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    let place_3 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[2].id);
    let place_4 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[3].id);
    let poi_1 = player_list[player_of_interest_1 - 1];
    let poi_2 = player_list[player_of_interest_2 - 1];
    let top4 = [place_1.id, place_2.id, place_3.id, place_4.id]
    if (print_gate) {
        console.log(poi_1.id, poi_2.id)
        console.log(top4[0], top4[1], top4[2], top4[3])
    }
    //check if both are in top4
    if (!(top4.includes(poi_1.id) && top4.includes(poi_2.id))) { return false }
    //check if they are on 1 and 4
    if ((place_1.id === poi_1.id || place_1.id === poi_2.id) && (place_4.id === poi_1.id || place_4.id === poi_2.id)) { return false }
    //check if they are on 2 and 3
    if ((place_2.id === poi_1.id || place_2.id === poi_2.id) && (place_3.id === poi_1.id || place_3.id === poi_2.id)) { return false }
    return true
}

function player1_or2_not_on_forth_place(group) {
    //just a quick check, that doesn't have real meaning
    let place_4 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[3].id);
    let poi_1 = player_list[player_of_interest_1 - 1];
    let poi_2 = player_list[player_of_interest_2 - 1];
    if (place_4.id === poi_1.id || place_4.id === poi_2.id) { return false }
    return true
}
console.log(player_list)

function measure_accuracy_of_places(group_id){
//compares expected place with actual place
//the higher the number, the less accurate is the placement
let accuracy_points = [];
for(let player of player_list){
    let expected_places = get_places_of_player_id(sort_players_skill(group_id),player.id,undefined)
    let actual_places = get_places_of_player_id(sort_players_final_score(group_id,undefined),player.id,undefined)
    //if two players have the same skill, both places are acceptable
    //if two players have the same place, it is not acceptable
    let distance = 0;
    let a_distances = [];
    for(let a of actual_places){
        let e_distances = [];
        for(let e of expected_places){
            distance = Math.abs(a-e);
            e_distances.push(distance);
        }
        let e_distance_min = Math.min(...e_distances);
        a_distances.push(e_distance_min);
    }
    let accuracy_value = Math.max(...a_distances)
    accuracy_points.push(accuracy_value);
    if(print_gate){
        console.log(`Player: ${player.name}`)
        console.log(`Expected Places: ${expected_places.join(' ')}`)
        console.log(`Actual Places: ${actual_places.join(' ')}`)
        console.log(`Distance: ${accuracy_value}`)
        }
}
let accuracy_sum = accuracy_points.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
return accuracy_sum
}














// BLOSSOM
/*Converted to JS from Python by Matt Krick. Original: http://jorisvr.nl/maximummatching.html*/
/*https://github.com/mattkrick/EdmondsBlossom/tree/master*/
class Edmonds {
    constructor (edges, maxCardinality) {
        this.edges = edges;
        this.maxCardinality = maxCardinality;
        this.nEdge = edges.length;
        this.init();
    }
}

//INIT STUFF//
Edmonds.prototype.init = function () {
    this.nVertexInit();
    this.maxWeightInit();
    this.endpointInit();
    this.neighbendInit();
    this.mate = filledArray(this.nVertex, -1);
    this.label = filledArray(2 * this.nVertex, 0); //remove?
    this.labelEnd = filledArray(2 * this.nVertex, -1);
    this.inBlossomInit();
    this.blossomParent = filledArray(2 * this.nVertex, -1);
    this.blossomChilds = initArrArr(2 * this.nVertex);
    this.blossomBaseInit();
    this.blossomEndPs = initArrArr(2 * this.nVertex);
    this.bestEdge = filledArray(2 * this.nVertex, -1); //remove?
    this.blossomBestEdges = initArrArr(2 * this.nVertex); //remove?
    this.unusedBlossomsInit();
    this.dualVarInit();
    this.allowEdge = filledArray(this.nEdge, false); //remove?
    this.queue = []; //remove?
};

Edmonds.prototype.maxWeightMatching = function () {
    for (var t = 0; t < this.nVertex; t++) {
        //console.log('DEBUG: STAGE ' + t);
        this.label = filledArray(2 * this.nVertex, 0);
        this.bestEdge = filledArray(2 * this.nVertex, -1);
        this.blossomBestEdges = initArrArr(2 * this.nVertex);
        this.allowEdge = filledArray(this.nEdge, false);
        this.queue = [];
        for (var v = 0; v < this.nVertex; v++) {
            if (this.mate[v] === -1 && this.label[this.inBlossom[v]] === 0) {
                this.assignLabel(v, 1, -1);
            }
        }
        var augmented = false;
        while (true) {
            //console.log('DEBUG: SUBSTAGE');
            while (this.queue.length > 0 && !augmented) {
                v = this.queue.pop();
                //console.log('DEBUG: POP ', 'v=' + v);
                //console.assert(this.label[this.inBlossom[v]] == 1);
                for (var ii = 0; ii < this.neighbend[v].length; ii++) {
                    var p = this.neighbend[v][ii];
                    var k = ~~(p / 2);
                    var w = this.endpoint[p];
                    if (this.inBlossom[v] === this.inBlossom[w]) continue;
                    if (!this.allowEdge[k]) {
                        var kSlack = this.slack(k);
                        if (kSlack <= 0) {
                            this.allowEdge[k] = true;
                        }
                    }
                    if (this.allowEdge[k]) {
                        if (this.label[this.inBlossom[w]] === 0) {
                            this.assignLabel(w, 2, p ^ 1);
                        } else if (this.label[this.inBlossom[w]] === 1) {
                            var base = this.scanBlossom(v, w);
                            if (base >= 0) {
                                this.addBlossom(base, k);
                            } else {
                                this.augmentMatching(k);
                                augmented = true;
                                break;
                            }
                        } else if (this.label[w] === 0) {
                            //console.assert(this.label[this.inBlossom[w]] === 2);
                            this.label[w] = 2;
                            this.labelEnd[w] = p ^ 1;
                        }
                    } else if (this.label[this.inBlossom[w]] === 1) {
                        var b = this.inBlossom[v];
                        if (this.bestEdge[b] === -1 || kSlack < this.slack(this.bestEdge[b])) {
                            this.bestEdge[b] = k;
                        }
                    } else if (this.label[w] === 0) {
                        if (this.bestEdge[w] === -1 || kSlack < this.slack(this.bestEdge[w])) {
                            this.bestEdge[w] = k;
                        }
                    }
                }
            }
            if (augmented) break;
            var deltaType = -1;
            var delta = [];
            var deltaEdge = [];
            var deltaBlossom = [];
            if (!this.maxCardinality) {
                deltaType = 1;
                delta = getMin(this.dualVar, 0, this.nVertex - 1);
            }
            for (v = 0; v < this.nVertex; v++) {
                if (this.label[this.inBlossom[v]] === 0 && this.bestEdge[v] !== -1) {
                    var d = this.slack(this.bestEdge[v]);
                    if (deltaType === -1 || d < delta) {
                        delta = d;
                        deltaType = 2;
                        deltaEdge = this.bestEdge[v];
                    }
                }
            }
            for (b = 0; b < 2 * this.nVertex; b++) {
                if (this.blossomParent[b] === -1 && this.label[b] === 1 && this.bestEdge[b] !== -1) {
                    kSlack = this.slack(this.bestEdge[b]);
                    ////console.assert((kSlack % 2) == 0);
                    d = kSlack / 2;
                    if (deltaType === -1 || d < delta) {
                        delta = d;
                        deltaType = 3;
                        deltaEdge = this.bestEdge[b];
                    }
                }
            }
            for (b = this.nVertex; b < this.nVertex * 2; b++) {
                if (this.blossomBase[b] >= 0 && this.blossomParent[b] === -1 && this.label[b] === 2 && (deltaType === -1 || this.dualVar[b] < delta)) {
                    delta = this.dualVar[b];
                    deltaType = 4;
                    deltaBlossom = b;
                }
            }
            if (deltaType === -1) {
                //console.assert(this.maxCardinality);
                deltaType = 1;
                delta = Math.max(0, getMin(this.dualVar, 0, this.nVertex - 1));
            }
            for (v = 0; v < this.nVertex; v++) {
                var curLabel = this.label[this.inBlossom[v]];
                if (curLabel === 1) {
                    this.dualVar[v] -= delta;
                } else if (curLabel === 2) {
                    this.dualVar[v] += delta;
                }
            }
            for (b = this.nVertex; b < this.nVertex * 2; b++) {
                if (this.blossomBase[b] >= 0 && this.blossomParent[b] === -1) {
                    if (this.label[b] === 1) {
                        this.dualVar[b] += delta;
                    } else if (this.label[b] === 2) {
                        this.dualVar[b] -= delta;
                    }
                }
            }
            //console.log('DEBUG: deltaType', deltaType, ' delta: ', delta);
            if (deltaType === 1) {
                break;
            } else if (deltaType === 2) {
                this.allowEdge[deltaEdge] = true;
                var i = this.edges[deltaEdge][0];
                var j = this.edges[deltaEdge][1];
                var wt = this.edges[deltaEdge][2];
                if (this.label[this.inBlossom[i]] === 0) {
                    i = i ^ j;
                    j = j ^ i;
                    i = i ^ j;
                }
                //console.assert(this.label[this.inBlossom[i]] == 1);
                this.queue.push(i);
            } else if (deltaType === 3) {
                this.allowEdge[deltaEdge] = true;
                i = this.edges[deltaEdge][0];
                j = this.edges[deltaEdge][1];
                wt = this.edges[deltaEdge][2];
                //console.assert(this.label[this.inBlossom[i]] == 1);
                this.queue.push(i);
            } else if (deltaType === 4) {
                this.expandBlossom(deltaBlossom, false);
            }
        }
        if (!augmented) break;
        for (b = this.nVertex; b < this.nVertex * 2; b++) {
            if (this.blossomParent[b] === -1 && this.blossomBase[b] >= 0 && this.label[b] === 1 && this.dualVar[b] === 0) {
                this.expandBlossom(b, true);
            }
        }
    }
    for (v = 0; v < this.nVertex; v++) {
        if (this.mate[v] >= 0) {
            this.mate[v] = this.endpoint[this.mate[v]];
        }
    }
    for (v = 0; v < this.nVertex; v++) {
        //console.assert(this.mate[v] == -1 || this.mate[this.mate[v]] == v);
    }
    return this.mate;
};

Edmonds.prototype.slack = function (k) {
    var i = this.edges[k][0];
    var j = this.edges[k][1];
    var wt = this.edges[k][2];
    return this.dualVar[i] + this.dualVar[j] - 2 * wt;
};

Edmonds.prototype.blossomLeaves = function (b) {
    if (b < this.nVertex) {
        return [b];
    }
    var leaves = [];
    var childList = this.blossomChilds[b];
    for (var t = 0; t < childList.length; t++) {
        if (childList[t] <= this.nVertex) {
            leaves.push(childList[t]);
        } else {
            var leafList = this.blossomLeaves(childList[t]);
            for (var v = 0; v < leafList.length; v++) {
                leaves.push(leafList[v]);
            }
        }
    }
    return leaves;
};

Edmonds.prototype.assignLabel = function (w, t, p) {
    //console.log('DEBUG: assignLabel(' + w + ',' + t + ',' + p + '}');
    var b = this.inBlossom[w];
    //console.assert(this.label[w] === 0 && this.label[b] === 0);
    this.label[w] = this.label[b] = t;
    this.labelEnd[w] = this.labelEnd[b] = p;
    this.bestEdge[w] = this.bestEdge[b] = -1;
    if (t === 1) {
        this.queue.push.apply(this.queue, this.blossomLeaves(b));
        //console.log('DEBUG: PUSH ' + this.blossomLeaves(b).toString());
    } else if (t === 2) {
        var base = this.blossomBase[b];
        //console.assert(this.mate[base] >= 0);
        this.assignLabel(this.endpoint[this.mate[base]], 1, this.mate[base] ^ 1);
    }
};

Edmonds.prototype.scanBlossom = function (v, w) {
    //console.log('DEBUG: scanBlossom(' + v + ',' + w + ')');
    var path = [];
    var base = -1;
    while (v !== -1 || w !== -1) {
        var b = this.inBlossom[v];
        if ((this.label[b] & 4)) {
            base = this.blossomBase[b];
            break;
        }
        //console.assert(this.label[b] === 1);
        path.push(b);
        this.label[b] = 5;
        //console.assert(this.labelEnd[b] === this.mate[this.blossomBase[b]]);
        if (this.labelEnd[b] === -1) {
            v = -1;
        } else {
            v = this.endpoint[this.labelEnd[b]];
            b = this.inBlossom[v];
            //console.assert(this.label[b] === 2);
            //console.assert(this.labelEnd[b] >= 0);
            v = this.endpoint[this.labelEnd[b]];
        }
        if (w !== -1) {
            v = v ^ w;
            w = w ^ v;
            v = v ^ w;
        }
    }
    for (var ii = 0; ii < path.length; ii++) {
        b = path[ii];
        this.label[b] = 1;
    }
    return base;
};

Edmonds.prototype.addBlossom = function (base, k) {
    var v = this.edges[k][0];
    var w = this.edges[k][1];
    var wt = this.edges[k][2];
    var bb = this.inBlossom[base];
    var bv = this.inBlossom[v];
    var bw = this.inBlossom[w];
    var b = this.unusedBlossoms.pop();
    //console.log('DEBUG: addBlossom(' + base + ',' + k + ')' + ' (v=' + v + ' w=' + w + ')' + ' -> ' + b);
    this.blossomBase[b] = base;
    this.blossomParent[b] = -1;
    this.blossomParent[bb] = b;
    var path = this.blossomChilds[b] = [];
    var endPs = this.blossomEndPs[b] = [];
    while (bv !== bb) {
        this.blossomParent[bv] = b;
        path.push(bv);
        endPs.push(this.labelEnd[bv]);
        //console.assert(this.label[bv] === 2 || (this.label[bv] === 1 && this.labelEnd[bv] === this.mate[this.blossomBase[bv]]));
        //console.assert(this.labelEnd[bv] >= 0);
        v = this.endpoint[this.labelEnd[bv]];
        bv = this.inBlossom[v];
    }
    path.push(bb);
    path.reverse();
    endPs.reverse();
    endPs.push((2 * k));
    while (bw !== bb) {
        this.blossomParent[bw] = b;
        path.push(bw);
        endPs.push(this.labelEnd[bw] ^ 1);
        //console.assert(this.label[bw] === 2 || (this.label[bw] === 1 && this.labelEnd[bw] === this.mate[this.blossomBase[bw]]));
        //console.assert(this.labelEnd[bw] >= 0);
        w = this.endpoint[this.labelEnd[bw]];
        bw = this.inBlossom[w];
    }
    //console.assert(this.label[bb] === 1);
    this.label[b] = 1;
    this.labelEnd[b] = this.labelEnd[bb];
    this.dualVar[b] = 0;
    var leaves = this.blossomLeaves(b);
    for (var ii = 0; ii < leaves.length; ii++) {
        v = leaves[ii];
        if (this.label[this.inBlossom[v]] === 2) {
            this.queue.push(v);
        }
        this.inBlossom[v] = b;
    }
    var bestEdgeTo = filledArray(2 * this.nVertex, -1);
    for (ii = 0; ii < path.length; ii++) {
        bv = path[ii];
        if (this.blossomBestEdges[bv].length === 0) {
            var nbLists = [];
            leaves = this.blossomLeaves(bv);
            for (var x = 0; x < leaves.length; x++) {
                v = leaves[x];
                nbLists[x] = [];
                for (var y = 0; y < this.neighbend[v].length; y++) {
                    var p = this.neighbend[v][y];
                    nbLists[x].push(~~(p / 2));
                }
            }
        } else {
            nbLists = [this.blossomBestEdges[bv]];
        }
        //console.log('DEBUG: nbLists ' + nbLists.toString());
        for (x = 0; x < nbLists.length; x++) {
            var nbList = nbLists[x];
            for (y = 0; y < nbList.length; y++) {
                k = nbList[y];
                var i = this.edges[k][0];
                var j = this.edges[k][1];
                wt = this.edges[k][2];
                if (this.inBlossom[j] === b) {
                    i = i ^ j;
                    j = j ^ i;
                    i = i ^ j;
                }
                var bj = this.inBlossom[j];
                if (bj !== b && this.label[bj] === 1 && (bestEdgeTo[bj] === -1 || this.slack(k) < this.slack(bestEdgeTo[bj]))) {
                    bestEdgeTo[bj] = k;
                }
            }
        }
        this.blossomBestEdges[bv] = [];
        this.bestEdge[bv] = -1;
    }
    var be = [];
    for (ii = 0; ii < bestEdgeTo.length; ii++) {
        k = bestEdgeTo[ii];
        if (k !== -1) {
            be.push(k);
        }
    }
    this.blossomBestEdges[b] = be;
    //console.log('DEBUG: blossomBestEdges[' + b + ']= ' + this.blossomBestEdges[b].toString());
    this.bestEdge[b] = -1;
    for (ii = 0; ii < this.blossomBestEdges[b].length; ii++) {
        k = this.blossomBestEdges[b][ii];
        if (this.bestEdge[b] === -1 || this.slack(k) < this.slack(this.bestEdge[b])) {
            this.bestEdge[b] = k;
        }
    }
    //console.log('DEBUG: blossomChilds[' + b + ']= ' + this.blossomChilds[b].toString());
};

Edmonds.prototype.expandBlossom = function (b, endStage) {
    //console.log('DEBUG: expandBlossom(' + b + ',' + endStage + ') ' + this.blossomChilds[b].toString());
    for (var ii = 0; ii < this.blossomChilds[b].length; ii++) {
        var s = this.blossomChilds[b][ii];
        this.blossomParent[s] = -1;
        if (s < this.nVertex) {
            this.inBlossom[s] = s;
        } else if (endStage && this.dualVar[s] === 0) {
            this.expandBlossom(s, endStage);
        } else {
            var leaves = this.blossomLeaves(s);
            for (var jj = 0; jj < leaves.length; jj++) {
                var v = leaves[jj];
                this.inBlossom[v] = s;
            }
        }
    }
    if (!endStage && this.label[b] === 2) {
        //console.assert(this.labelEnd[b] >= 0);
        var entryChild = this.inBlossom[this.endpoint[this.labelEnd[b] ^ 1]];
        var j = this.blossomChilds[b].indexOf(entryChild);
        if ((j & 1)) {
            j -= this.blossomChilds[b].length;
            var jStep = 1;
            var endpTrick = 0;
        } else {
            jStep = -1;
            endpTrick = 1;
        }
        var p = this.labelEnd[b];
        while (j !== 0) {
            this.label[this.endpoint[p ^ 1]] = 0;
            this.label[this.endpoint[pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick ^ 1]] = 0;
            this.assignLabel(this.endpoint[p ^ 1], 2, p);
            this.allowEdge[~~(pIndex(this.blossomEndPs[b], j - endpTrick) / 2)] = true;
            j += jStep;
            p = pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick;
            this.allowEdge[~~(p / 2)] = true;
            j += jStep;
        }
        var bv = pIndex(this.blossomChilds[b], j);
        this.label[this.endpoint[p ^ 1]] = this.label[bv] = 2;

        this.labelEnd[this.endpoint[p ^ 1]] = this.labelEnd[bv] = p;
        this.bestEdge[bv] = -1;
        j += jStep;
        while (pIndex(this.blossomChilds[b], j) !== entryChild) {
            bv = pIndex(this.blossomChilds[b], j);
            if (this.label[bv] === 1) {
                j += jStep;
                continue;
            }
            leaves = this.blossomLeaves(bv);
            for (ii = 0; ii < leaves.length; ii++) {
                v = leaves[ii];
                if (this.label[v] !== 0) break;
            }
            if (this.label[v] !== 0) {
                //console.assert(this.label[v] === 2);
                //console.assert(this.inBlossom[v] === bv);
                this.label[v] = 0;
                this.label[this.endpoint[this.mate[this.blossomBase[bv]]]] = 0;
                this.assignLabel(v, 2, this.labelEnd[v]);
            }
            j += jStep;
        }
    }
    this.label[b] = this.labelEnd[b] = -1;
    this.blossomEndPs[b] = this.blossomChilds[b] = [];
    this.blossomBase[b] = -1;
    this.blossomBestEdges[b] = [];
    this.bestEdge[b] = -1;
    this.unusedBlossoms.push(b);
};

Edmonds.prototype.augmentBlossom = function (b, v) {
    //console.log('DEBUG: augmentBlossom(' + b + ',' + v + ')');
    var i, j;
    var t = v;
    while (this.blossomParent[t] !== b) {
        t = this.blossomParent[t];
    }
    if (t > this.nVertex) {
        this.augmentBlossom(t, v);
    }
    i = j = this.blossomChilds[b].indexOf(t);
    if ((i & 1)) {
        j -= this.blossomChilds[b].length;
        var jStep = 1;
        var endpTrick = 0;
    } else {
        jStep = -1;
        endpTrick = 1;
    }
    while (j !== 0) {
        j += jStep;
        t = pIndex(this.blossomChilds[b], j);
        var p = pIndex(this.blossomEndPs[b], j - endpTrick) ^ endpTrick;
        if (t >= this.nVertex) {
            this.augmentBlossom(t, this.endpoint[p]);
        }
        j += jStep;
        t = pIndex(this.blossomChilds[b], j);
        if (t >= this.nVertex) {
            this.augmentBlossom(t, this.endpoint[p ^ 1]);
        }
        this.mate[this.endpoint[p]] = p ^ 1;
        this.mate[this.endpoint[p ^ 1]] = p;
    }
    //console.log('DEBUG: PAIR ' + this.endpoint[p] + ' ' + this.endpoint[p^1] + '(k=' + ~~(p/2) + ')');
    this.blossomChilds[b] = this.blossomChilds[b].slice(i).concat(this.blossomChilds[b].slice(0, i));
    this.blossomEndPs[b] = this.blossomEndPs[b].slice(i).concat(this.blossomEndPs[b].slice(0, i));
    this.blossomBase[b] = this.blossomBase[this.blossomChilds[b][0]];
    //console.assert(this.blossomBase[b] === v);
};

Edmonds.prototype.augmentMatching = function (k) {
    var v = this.edges[k][0];
    var w = this.edges[k][1];
    //console.log('DEBUG: augmentMatching(' + k + ')' + ' (v=' + v + ' ' + 'w=' + w);
    //console.log('DEBUG: PAIR ' + v + ' ' + w + '(k=' + k + ')');
    for (var ii = 0; ii < 2; ii++) {
        if (ii === 0) {
            var s = v;
            var p = 2 * k + 1;
        } else {
            s = w;
            p = 2 * k;
        }
        while (true) {
            var bs = this.inBlossom[s];
            //console.assert(this.label[bs] === 1);
            //console.assert(this.labelEnd[bs] === this.mate[this.blossomBase[bs]]);
            if (bs >= this.nVertex) {
                this.augmentBlossom(bs, s);
            }
            this.mate[s] = p;
            if (this.labelEnd[bs] === -1) break;
            var t = this.endpoint[this.labelEnd[bs]];
            var bt = this.inBlossom[t];
            //console.assert(this.label[bt] === 2);
            //console.assert(this.labelEnd[bt] >= 0);
            s = this.endpoint[this.labelEnd[bt]];
            var j = this.endpoint[this.labelEnd[bt] ^ 1];
            //console.assert(this.blossomBase[bt] === t);
            if (bt >= this.nVertex) {
                this.augmentBlossom(bt, j);
            }
            this.mate[j] = this.labelEnd[bt];
            p = this.labelEnd[bt] ^ 1;
            //console.log('DEBUG: PAIR ' + s + ' ' + t + '(k=' + ~~(p/2) + ')');


        }
    }
};



Edmonds.prototype.blossomBaseInit = function () {
    var base = [];
    for (var i = 0; i < this.nVertex; i++) {
        base[i] = i;
    }
    var negs = filledArray(this.nVertex, -1);
    this.blossomBase = base.concat(negs);
};
Edmonds.prototype.dualVarInit = function () {
    var mw = filledArray(this.nVertex, this.maxWeight);
    var zeros = filledArray(this.nVertex, 0);
    this.dualVar = mw.concat(zeros);
};
Edmonds.prototype.unusedBlossomsInit = function () {
    var i, unusedBlossoms = [];
    for (i = this.nVertex; i < 2 * this.nVertex; i++) {
        unusedBlossoms.push(i);
    }
    this.unusedBlossoms = unusedBlossoms;
};
Edmonds.prototype.inBlossomInit = function () {
    var i, inBlossom = [];
    for (i = 0; i < this.nVertex; i++) {
        inBlossom[i] = i;
    }
    this.inBlossom = inBlossom;
};
Edmonds.prototype.neighbendInit = function () {
    var k, i, j;
    var neighbend = initArrArr(this.nVertex);
    for (k = 0; k < this.nEdge; k++) {
        i = this.edges[k][0];
        j = this.edges[k][1];
        neighbend[i].push(2 * k + 1);
        neighbend[j].push(2 * k);
    }
    this.neighbend = neighbend;
};
Edmonds.prototype.endpointInit = function () {
    var p;
    var endpoint = [];
    for (p = 0; p < 2 * this.nEdge; p++) {
        endpoint[p] = this.edges[~~(p / 2)][p % 2];
    }
    this.endpoint = endpoint;
};
Edmonds.prototype.nVertexInit = function () {
    var nVertex = 0;
    for (var k = 0; k < this.nEdge; k++) {
        var i = this.edges[k][0];
        var j = this.edges[k][1];
        if (i >= nVertex) nVertex = i + 1;
        if (j >= nVertex) nVertex = j + 1;
    }
    this.nVertex = nVertex;
};
Edmonds.prototype.maxWeightInit = function () {
    var maxWeight = 0;
    for (var k = 0; k < this.nEdge; k++) {
        var weight = this.edges[k][2];
        if (weight > maxWeight) {
            maxWeight = weight;
        }
    }
    this.maxWeight = maxWeight;
};

//HELPERS//
function filledArray(len, fill) {
    var i, newArray = [];
    for (i = 0; i < len; i++) {
        newArray[i] = fill;
    }
    return newArray;
}

function initArrArr(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr[i] = [];
    }
    return arr;
}

function getMin(arr, start, end) {
    var min = Infinity;
    for (var i = start; i <= end; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    return min;
}

function pIndex(arr, idx) {
    //if idx is negative, go from the back
    return idx < 0 ? arr[arr.length + idx] : arr[idx];
}


// module.exports = function (edges, maxCardinality) {
function blossom (edges, maxCardinality) {
    if (edges.length === 0) {
        return edges;
    }
    var edmonds = new Edmonds(edges, maxCardinality);
    return edmonds.maxWeightMatching();

};

let all_edges = [];

function pair_players() {
    let pairs = [];
    // const bye = { id: -1, name: 'bye', skill: 0, games: [] }
    if (round === 1) {
        let p_list;
        if (randomize_round_1) {
            p_list = Array.from(Array(player_list.length).keys())
            shuffleArray(p_list);
        } else {
            p_list = player_list.map((player, index) => [index, player.skill]).sort((a, b) => b[1] - a[1]).map(v => v[0]);
        }

        let i;
        for (i = 1; i < player_list.length; i += 2) {
            pairs.push([player_list[i - 1], player_list[i]]);
        }
        if (player_list.length % 2 === 1) {
            pairs.push([player_list[i - 1], bye]);
        }
        return pairs;
    }

    // create edges for each player
    let scores = player_list.map(player => calc_score(player));
    if(print_gate) {console.log(scores)}
    let edges = [];
    for (let i = 0; i < player_list.length; i++) {
        let p1 = player_list[i];
        let j;
        for (j = i + 1; j < player_list.length; j++) {
            let p2 = player_list[j];

            if (p1.games.some(v => v.opponent.id === p2.id)) {
                continue;
            }

            let distance = Math.abs(scores[i] - scores[j]);
            let weight = player_list.length * 16 - distance * Math.max(scores[i], scores[j]);
            //let weight = Math.max(scores[i], scores[j]) * distance;

            edges.push([i, j, weight]);
        }

        // if (player_list.length % 2 === 1 && !p1.games.some(v => v.opponent.id === -1)) {
        //     // j at this point is player_list.length
        //     edges.push([i, j, 1]);
        // }
    }
    if(print_gate) {
    /* console.log(player_list)
    console.log(scores)
    console.log(edges) */
        }
    let result = blossom(edges, true);
    for (let i = 0; i < result.length - 1; i++) {
        if (i > result[i]) {
            continue;
        }
        pairs.push([
            player_list[i],
            (result[i] === player_list.length) ? bye : player_list[result[i]]
        ]);
        if (!player_list[result[i]]) {
            console.error('For some reason got a null')
            console.error('Edges')
            console.error(edges)
            console.error('Result')
            console.error(result)
            
            console.error('player_list')
            console.error(player_list)
            console.error('pairs')
            console.error(pairs)

        }
    }
    pairs = pairs.sort((a,b) => calc_score(b[0]) - calc_score(a[0]));
    all_edges.push({round: round, edges: edges, scores: scores, pairs: pairs});
    return pairs;
}

function old_pair_players() {
    //old version
    let pairs = [];

    let ignored_player = null;

    let buckets = generate_buckets();
    let keys = Object.keys(buckets).sort((a, b) => b - a);
    let i = 0;

    // first key is the highest score
    all:
    while (i < keys.length) {
        let p1 = buckets[keys[i]].pop();

        let j = i;
        let index;
        while ((index = find_opponent(p1, buckets[keys[j]])) === -1) {
            j += 1;
            if (j >= keys.length) {
                ignored_player = p1;
                break all;
            }
        }
        let p2 = buckets[keys[j]].splice(index, 1)[0];
        pairs.push([p1, p2]);

        while (i < keys.length && buckets[keys[i]].length === 0) {
            i += 1;
        }
    }

    if (ignored_player != null) {
        pairs.push([ignored_player, { id: -1, skill: 0, games: [], name: "bye" }]);
    }

    return pairs;
}


//This is where the simulation starts
let print_gate;
for (let n = 1; n <= simulations; n++) {
    //reset player_list
    for (let player of player_list) {
        player.games = [];
    }

    if (player_list.length % 2 === 1) {
        player_list.push({ id: -1, group: 0, skill: 0, games: [], name: "bye" });
    }

    print_gate = (print_only_last_simulation !== true || n === simulations);
    let pad_size = player_list.map(p => p.name.length).sort((a, b) => b - a)[0];
    for (round = 1; round <= rounds; round++) {
        if (print_gate) { console.log(`\n### Round ${round} ###`); }

        let pair_counter = 0;
        let pairs = []
        while (pair_counter < 10 && pairs.length !== Math.ceil(player_list.length / 2)) {
            pairs = pair_players();
            pair_counter++;
        }

        if (pairs.length !== Math.ceil(player_list.length / 2)) {
            console.error('');
            console.error(`ERROR: players [${player_list.filter(v => !pairs.some(p => p[0] === v || p[1] === v)).map(p => p.name + ' (sk=' + p.skill + ',score=' + calc_score(p) + ',opp=[' + p.games.map(g => g.opponent.name).join(',') + '])').join(', ')}] were not matched!`);
            
            for (let pair of pairs) {
                console.error(`${pair[0].name} (${pair[0].id}, ${pair[0].skill}, ${calc_score(pair[0])}, played against ${pair[0].games.map(g => g.opponent.name).join(', ')}) vs ${pair[1].name} (${pair[1].id}, ${pair[1].skill}, ${calc_score(pair[1])}, played against ${pair[1].games.map(g => g.opponent.name).join(', ')})`);
            }
        }



        let resStrs = { 0: '0-1', 0.5: '½-½', 1: '1-0' };

        for (let pair of pairs) {
                let p1S
                let p2S
                let win_perc
            if (print_gate) {
                p1S = `${pair[0].name.padStart(pad_size)} (${calc_score(pair[0], round)})`; //calc_score(pair[0])
                p2S = `${pair[1].name.padStart(pad_size)} (${calc_score(pair[1], round)})`; //pair[1].skill

                let skill_gap = Math.abs(pair[0].skill - pair[1].skill);
                win_perc
                if (skill_gap + 1 > win_percentage_skillgap.length) { win_perc = 100 }
                else { win_perc = win_percentage_skillgap[skill_gap] } //if skill gap is zero --> first entry
            }
            let result = determine_result(pair[0], pair[1]);
            pair[0].games.push({ round: round, opponent: pair[1], result: result });
            if (pair[1].id !== -1) {
                pair[1].games.push({ round: round, opponent: pair[0], result: 1 - result });
            }

            if (print_gate) {console.log(`${resStrs[result]} ${p1S} vs ${p2S} ${win_perc}%`);}
        }
    }

    //delete bye player
    for (let i = 0; i < player_list.length; i++) {
        if (player_list[i].name === "bye") {
            player_list.splice(i, 1);
          break; // Exit the loop after deleting the object
        }
      }
    
    //Print Results
    if (print_gate) {
        console.log(``);
        console.log(`### Result ###`);
        for (let player of player_list.map(p => ({ ...p, score: calc_final_score(p) })).sort((a, b) => b.score - a.score)) {
            console.log(`${player.name.padStart(pad_size)} (${player.skill}), ${player.score}`);
        }
    }

    simulation_results.push(check_condition());
    if (print_gate) {
        console.log(simulation_results[n - 1]);
    }
}
//console.log(simulation_results)
if(simulation_results[0] === true || simulation_results[0] === false){
console.log(check_percent(simulation_results)) //console.log(player_list);
} else {
let sum = simulation_results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
let average = (sum / simulation_results.length).toFixed(2);
console.log(average)
}



