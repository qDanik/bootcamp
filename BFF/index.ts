export type TTeamMap = Map<number, Team>;
export type TMatchDay = Set<MatchDay>;

export class Team {
    constructor(private id: number, private name: string) {}

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public toString(): string {
        return `Team: ${this.getName()}`;
    }
}

class MatchDay {
    private matches: Set<Match> = new Set<Match>();

    constructor(private matchDay: number) {}

    getMatchDay(): number {
        return this.matchDay;
    }

    getMatches(): Set<Match> {
        return this.matches;
    }

    push(host: Team, visitor: Team): boolean {
        const match: Match = new Match(host, visitor);
        this.matches.add(match);

        return true;
    }
}

class Match {
    constructor(private host: Team, private visitor: Team) {}

    getHost(): Team {
        return this.host;
    }

    getVisitor(): Team {
        return this.visitor;
    }

    public toString(): string {
        return `${this.getHost().getName()} - ${this.getVisitor().getName()}`;
    }
}

class Schedule {
    private readonly matchDayCount: number;
    private matchDays: TMatchDay = new Set();
    private initialSchedule: Team[][] = [];

    constructor(private teams: TTeamMap) {
        this.matchDayCount = teams.size;
        let pair: Team[] = [];
        teams.forEach((team:Team) => {
            pair.push(team);

            if(pair.length == 2) {
                this.initialSchedule.push(pair);
                pair = [];
            }
        });
        this.initialSchedule.push(pair);
    };

    private configureMatchDay(matchDayNumber: number): void {
        const matchDay: MatchDay = this.initialSchedule.reduce((acc: MatchDay, item: Team[]): MatchDay => {
            const [host, visitor] = item;
            if(!host || !visitor){
                return acc;
            }
            acc.push(host, visitor);

            return acc;
        }, new MatchDay(matchDayNumber));
        this.matchDays.add(matchDay);
    }

    private configureTeams(): void  {
        const pairLength: number = this.initialSchedule.length - 1;
        this.initialSchedule = this.initialSchedule.map((pair: Team[], index: number, schedule: Team[][]) => {
            let [host, visitors]: Team[] = pair;

            if(index === pairLength) {
                host = visitors;
            }

            if(index === 0) {
                [visitors] = schedule[index + 1];
            }

            if(index > 0) {
                [,visitors] = schedule[index - 1];
            }

            if(index > 0 && index < pairLength) {
                [host] = schedule[index + 1];
            }

            return [host, visitors];
        });
    }

    public build(): void {
        for (let matchDay: number = 1; matchDay <= this.matchDayCount; matchDay++) {
            this.configureMatchDay(matchDay);
            this.configureTeams();
        }
    }

    public get(): TMatchDay {
        return this.matchDays;
    }
}

const teams: TTeamMap = new Map([
    [1, new Team(1, 'BATE')],
    [2, new Team(2, 'Isloch')],
    [3, new Team(3, 'Shakhtar')],
    [4, new Team(4, 'Dinamo Brest')],
    [5, new Team(5, 'Torpedo Belaz')],
    [6, new Team(6, 'Dinamo Minsk')],
    [7, new Team(7, 'Vitebsk')],
]);

console.time('build');
const schedule: Schedule = new Schedule(teams);
schedule.build();
console.timeEnd('build');


//@ts-ignore
for(let matchDay of schedule.get()) {
    console.group(`Match Day #${matchDay.getMatchDay()}`);
    for(let match of matchDay.getMatches()) {
        console.log(match.toString());
    }
    console.groupEnd();
}
