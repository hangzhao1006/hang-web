n = 10
s = '' 

for i in range(n):
    part = f'[{i}]'
    s += part

print(s)


col_num = 10
row_num = 8

for y in range(row_num):
    si = f'row[{y}]'
    for x in range(col_num):
        if x%2 == 0:
            parts = 'o'
        else:
            parts = '.'
        si += parts
    
    print(si)