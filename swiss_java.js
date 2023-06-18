
//This is where you can change the details of the simulation
let simulations = 1000 //number of simulations
let simulation_results = [] //result for every simulation
let rounds = 7 //number of rounds

function check_condition() {
    //function goes in here, so you don't have to look it up down there
    return is_second_unhappy(1);
}

let player_of_interest_1 = 2
let player_of_interest_2 = 2
let player_of_interest_3 = 10

let draw_on_purpose = false
let randomize_round_1 = false
let print_only_last_simulation = true
let treat_bye_as_player = false

let win_percentage_skillgap = [50, 60, 70, 85, 90, 95, 98, 98, 100]

let player_list = [
    { id: 1, group: 0, name: "Julia", skill: 30, games: [] },
    { id: 2, group: 0, name: "Christian", skill: 27, games: [] },
    { id: 3, group: 0, name: "Reinhard", skill: 26, games: [] },
    { id: 4, group: 0, name: "PeterD", skill: 26, games: [] },
    { id: 5, group: 0, name: "GerhardF", skill: 19, games: [] },
    { id: 6, group: 0, name: "GerhardL", skill: 21, games: [] },
    { id: 7, group: 0, name: "Srdjan", skill: 22, games: [] },
    { id: 8, group: 0, name: "PeterR", skill: 19, games: [] },
    { id: 9, group: 1, name: "Clemens", skill: 22, games: [] },
    { id: 10, group: 1, name: "Johannes", skill: 8, games: [] },
    { id: 11, group: 1, name: "MichaelE", skill: 8, games: [] },
    { id: 12, group: 1, name: "Gergley", skill: 9, games: [] },
    { id: 13, group: 1, name: "Gernot", skill: 8, games: [] },
    { id: 14, group: 1, name: "Fabian", skill: 8, games: [] },
    { id: 15, group: 1, name: "Stephan", skill: 7, games: [] },
    { id: 16, group: 1, name: "MichaelR", skill: 8, games: [] },
    { id: 17, group: 1, name: "Aleyna", skill: 6, games: [] },
    { id: 18, group: 1, name: "Alexander", skill: 22, games: [] },
    { id: 19, group: 1, name: "Markus", skill: 22, games: [] },

]

//This is where the simulation starts
let print_gate;
for (let n = 1; n <= simulations; n++) {
    //reset player_list
    for (player of player_list) {
        delete player.games;
        player.games = []
    }

    print_gate = (print_only_last_simulation !== true || n === simulations);
    let pad_size = player_list.map(p => p.name.length).sort((a, b) => b - a)[0];
    for (let round = 1; round <= rounds; round++) {
        if (print_gate) { console.log(`\n### Round ${round} ###`); }

        let pair_counter = 0;
        let pairs = []
        while (pair_counter < 5 && pairs.length !== Math.ceil(player_list.length / 2)) {
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

        for (pair of pairs) {
            let result = determine_result(pair[0], pair[1]);
            pair[0].games.push({ round: round, opponent: pair[1], result: result });
            if (pair[1].id !== -1) {
                pair[1].games.push({ round: round, opponent: pair[0], result: 1 - result });
            }

            if (print_gate) {
                let p1S = `${pair[0].name.padStart(pad_size)} (${calc_score(pair[0], round)})`; //calc_score(pair[0])
                let p2S = `${pair[1].name.padStart(pad_size)} (${calc_score(pair[0], round)})`; //pair[1].skill

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
    let games = player.games;
    if (rounds) {
        games.slice(0, rounds);
    }
    //if(rounds === 1){return 0}
    return games.map(x => x.result).reduce((partialSum, a) => partialSum + a, 0);
}

function calc_final_score(player, rounds) {
    let games = player.games;
    if (rounds) {
        games.slice(0, rounds);
    }
    let opponent_scores = [];
    let opponent_opponent_scores = [];
    for (game of games) {
        if (game.opponent.id !== -1) {
            let opponent = game.opponent
            opponent_scores.push(calc_score(opponent, rounds));
            for (opgame of opponent.games) {
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

function generate_buckets(ignore_player_id) {
    // ignore_player_id is player that already was matched against "bye"
    // don't need to add them to the bucket
    let buckets = {};
    for (const player of player_list) {
        if (player.id === ignore_player_id) {
            continue;
        }

        let score = calc_score(player, undefined);
        if (score in buckets) {
            buckets[score].push(player);
        } else {
            buckets[score] = [player];
        }
    }
    if (typeof round !== 'undefined') {
        if (round === 1 && randomize_round_1) { return buckets }
    }
    for (const key of Object.keys(buckets)) {
        shuffleArray(buckets[key]);
    }
    return buckets;
}

function find_opponent(player, vs) {
    if (vs === undefined) { return -1 }
    if (player === undefined) { return -1 }
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
    if (player2.name === "bye") { return 1 }
    if (determine_draw(player1, player2)) { return 0.5 };
    let skill_gap = Math.abs(player1.skill - player2.skill);
    let win_perc
    if (skill_gap + 1 > win_percentage_skillgap.length) { win_perc = 100 }
    else { win_perc = win_percentage_skillgap[skill_gap] } //if skill gap is zero --> first entry
    if (player1.skill < player2.skill) { win_perc = 100 - win_perc }
    if (determine_win(win_perc)) { return 1 } else { return 0 }
}

function determine_win(win_perc) {
    let random = Math.floor(Math.random() * 100); //0 to 99
    return random < win_perc //e.g. 100 is always bigger, for 90 there is 0,...,89
}

function determine_draw(player1, player2) {
    //higher skill makes draw more likely
    let skill_average = (player1.skill + player2.skill) / 2;
    let skill_gap = Math.abs(player1.skill - player2.skill);
    let no_draw_perc
    if (skill_average > 24 && skill_gap < 5) { no_draw_perc = 82 + 4 * skill_gap } else { no_draw_perc = 100 }
    let random = Math.floor(Math.random() * 100); //0 to 99
    return random > no_draw_perc;
}

function check_percent(sim_results) {
    let trueCount = sim_results.filter((value) => value === true).length;
    let totalCount = sim_results.length;
    let truePercentage = (trueCount / totalCount) * 100;
    let roundedPercentage = truePercentage.toFixed(2);
    console.log(roundedPercentage + '%');
}


//##### Check functions

function is_player_of_interest1_first() {
    if (print_gate) { console.log(`Spieler von Interesse: ${player_list[player_of_interest_1 - 1].name} und Gewinner: ${sort_players_final_score(undefined, rounds)[0].name}`) }
    return (player_list[player_of_interest_1 - 1].id === sort_players_final_score(undefined, rounds)[0].id)
}

function is_second_unhappy(group) {
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
function is_third_unhappy(group) {
    //third player of group didn't get the chance to play first and second
    let p1 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[0].id);
    let p2 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[1].id);
    let p3 = player_list.find(obj => obj.id === sort_players_final_score(group, rounds)[2].id);

    if (print_gate) {
        let output = [];
        for (game of p3.games) {
            output.push(game.opponent.name)
        }
        console.log(`First: ${p1.name} Second: ${p2.name}`)
        console.log(`Third: ${p3.name}`)
        console.log(`Opponents: ${output}`)
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

console.log(player_list)

