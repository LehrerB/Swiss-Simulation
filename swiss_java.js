'use strict';

//This is where you can change the details of the simulation
let simulations = 200; //number of simulations
let simulation_results = []; //result for every simulation
let rounds = 7; //number of rounds
let round = 0; // current round

function check_condition() {
    //function goes in here, so you don't have to look it up down there
    return is_player_of_interest1_first(1);
}

/* 
is_player_of_interest1_first()
second_didnt_play_1()
third_didnt_play_1_or_2()
player1_player2_final_top4(group)
is_player_of_interest1_in_top_n(1,4)
*/

let player_of_interest_1 = 18
let player_of_interest_2 = 2
let player_of_interest_3 = 10

let draw_on_purpose = false
let randomize_round_1 = false
let print_only_last_simulation = true
let treat_bye_as_player = false //for tiebreak calculation

let win_percentage_skillgap = [50, 60, 70, 85, 90, 95, 98, 98, 100]

let player_list = [
    { id: 11, group: 0, skill: 30, games: [], name: "Julia" },
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

//This is where the simulation starts
let print_gate;
for (let n = 1; n <= simulations; n++) {
    //reset player_list
    for (let player of player_list) {
        player.games = []
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
            console.error('ERROR: some players were not matched!');
            for (let pair of pairs) {
                console.error(`${pair[0].name} (${pair[0].id}, ${pair[0].skill}, ${calc_score(pair[0])}, played against ${pair[0].games.map(g => g.opponent.name).join(', ')}) vs ${pair[1].name} (${pair[1].id}, ${pair[1].skill}, ${calc_score(pair[1])}, played against ${pair[1].games.map(g => g.opponent.name).join(', ')})`);
            }
        }



        let resStrs = { 0: '0-1', 0.5: '½-½', 1: '1-0' };

        for (let pair of pairs) {
            let result = determine_result(pair[0], pair[1]);
            pair[0].games.push({ round: round, opponent: pair[1], result: result });
            if (pair[1].id !== -1) {
                pair[1].games.push({ round: round, opponent: pair[0], result: 1 - result });
            }

            if (print_gate) {
                let p1S = `${pair[0].name.padStart(pad_size)} (${calc_score(pair[0], round)})`; //calc_score(pair[0])
                let p2S = `${pair[1].name.padStart(pad_size)} (${calc_score(pair[1], round)})`; //pair[1].skill

                let skill_gap = Math.abs(pair[0].skill - pair[1].skill);
                let win_perc
                if (skill_gap + 1 > win_percentage_skillgap.length) { win_perc = 100 }
                else { win_perc = win_percentage_skillgap[skill_gap] } //if skill gap is zero --> first entry

                console.log(`${resStrs[result]} ${p1S} vs ${p2S} ${win_perc}%`);
            }
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
console.log(check_percent(simulation_results)) //console.log(player_list);



//functions
function calc_score(player, rounds) {
    let sum = 0;
    // if rounds is undefined, sum score of all games
    if(rounds === undefined || rounds > player.games.length) {
        rounds = player.games.length;
    }
    for(let i = 0; i < rounds; i++) {
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

    let final_score = parseInt(calc_score(player, rounds) * 1000000) + parseInt(opponent_average * 1000) + parseInt(op_opponent_average)
    //console.log(opponent_average);
    //console.log(op_opponent_average);
    //console.log(final_score)
    return final_score
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generate_graph() {
    let n = player_list.length;
    if(n % 2 === 1) {
        n += 1;
    }
    let matrix = Array.from({length: n}, () => Array.from({length: n}, () => 0));
    
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

function pair_players() {
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


function determine_result(player1, player2) { //returns 0, 1 or 0.5
    if (player2.name === "bye") { return 1; }
    if (determine_draw(player1, player2)) { return 0.5; }
    let skill_gap = Math.abs(player1.skill - player2.skill);
    // skill_gap is 0 -> first entry, skill_gap >= array length -> 100
    let win_perc = win_percentage_skillgap[skill_gap] ?? 100;
    if (player1.skill < player2.skill) { win_perc = 100 - win_perc; }
    return (determine_win(win_perc)) ? 1 : 0;
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
    for (game of player.games) {
        if (game.result === 0) { op_lost_to.push(game.opponent) }
    }
    return op_lost_to
}

function calc_average_score(players) {
    //returns average score of playerlist
    if (players === []) { return -1 };
    let sum = 0;
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
    //second player of group didn't get the chance to play firt player
    let p1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let p2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    if (print_gate) {
        let output = [];
        for (game of p2.games) {
            output.push(game.opponent.name)
        }
        console.log(`First: ${p1.name}`)
        console.log(`Second: ${p2.name}`)
        console.log(`Opponents: ${output}`)
    }
    //if (calc_score(p1, rounds)>calc_score(p2, rounds)){return false}
    for (game of p2.games) {
        if (game.opponent.name === p1.name && game.result === 0) { return false }
    }
    return true
}

function third_didnt_play_1_or_2(group) {
    //third player of group didn't get the chance to play first and second
    let p1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let p2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    let p3 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[2].id);

    if (print_gate) {
        let output = [];
        for (opponent of opponents_lost_to(p3)) {
            output.push(opponent.name)
        }
        console.log(`First: ${p1.name} Second: ${p2.name}`)
        console.log(`Third: ${p3.name}`)
        console.log(`Opponents lost to: ${output}`)
    }
    for (game of p3.games) {
        if (game.opponent.name === p1.name && game.result === 0) { return false }
        if (game.opponent.name === p2.name && game.result === 0) { return false }
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


let k = 1