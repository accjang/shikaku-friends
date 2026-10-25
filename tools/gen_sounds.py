# 효과음을 합성해 assets/sounds/*.wav로 쓴다(외부 음원·라이선스 없음). 실행: python3 tools/gen_sounds.py
import math, os, random, struct, wave

RATE = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
os.makedirs(OUT, exist_ok=True)

def env(i, n, attack=0.01, release=0.6):
    t = i / RATE
    a = min(1.0, t / attack) if attack > 0 else 1.0
    r = max(0.0, 1 - i / n) ** (1 / release)
    return a * r

def tone(freqs, dur, vol=0.35, shape='sine', release=0.6, slide=0.0):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        s = 0.0
        for f in freqs:
            f2 = f * (1 + slide * t / dur)
            ph = 2 * math.pi * f2 * t
            if shape == 'sine':
                s += math.sin(ph)
            elif shape == 'tri':
                s += 2 / math.pi * math.asin(math.sin(ph))
        out.append(s / len(freqs) * vol * env(i, n, release=release))
    return out

def seq(parts, gap=0.0):
    out = []
    for p in parts:
        out += p + [0.0] * int(RATE * gap)
    return out

def write(name, samples):
    with wave.open(os.path.join(OUT, name + '.wav'), 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, s)) * 32000)) for s in samples))

C5, E5, G5, C6, E6, G6 = 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0
write('tap', tone([880], 0.05, 0.22, 'sine', release=0.3))
write('place', tone([C6, G6], 0.12, 0.3, 'tri', release=0.5, slide=0.08))
write('wrong', tone([196, 207], 0.18, 0.28, 'tri', release=0.8, slide=-0.15))
write('erase', tone([600], 0.07, 0.2, 'sine', release=0.4, slide=-0.4))
write('hint', seq([tone([E6], 0.08, 0.25), tone([G6], 0.08, 0.25), tone([C6 * 2], 0.16, 0.25)]))
write('clear', seq([tone([C5, E5], 0.11, 0.3, 'tri'), tone([E5, G5], 0.11, 0.3, 'tri'), tone([G5, C6], 0.11, 0.3, 'tri'),
                    tone([C6, E6, G6], 0.5, 0.32, 'tri', release=1.2)]))
# 풍선 터짐: 짧은 잡음 + 높은 음이 빠르게 떨어짐
random.seed(7)
pop = [(random.random() * 2 - 1) * 0.5 * max(0.0, 1 - i / (RATE * 0.05)) ** 3 for i in range(int(RATE * 0.05))]
pop = [a + b for a, b in zip(pop, tone([1400], 0.05, 0.25, 'sine', release=0.3, slide=-0.6))]
write('pop', pop)
# 소품 얻음: 반짝이는 위로 올라가는 세 음
write('reward', seq([tone([G5, C6], 0.09, 0.28, 'tri'), tone([C6, E6], 0.09, 0.28, 'tri'), tone([E6, G6, C6 * 2], 0.4, 0.3, 'tri', release=1.0)]))
print(sorted(os.listdir(OUT)))
