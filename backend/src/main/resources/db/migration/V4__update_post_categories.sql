UPDATE posts
SET category = CASE
    WHEN title = 'Kuchnia bez pośpiechu: zupa na pierwszy chłód' THEN 'kuchnia'
    WHEN title = 'O tym, dlaczego nie musimy być zawsze dostępne' THEN 'dlaczego?'
    ELSE 'inne'
END
WHERE title IN (
    'Jak odpoczywać, kiedy lista zadań nie ma końca?',
    'Sobotni spacer, który zaczął się od kawy',
    'Kuchnia bez pośpiechu: zupa na pierwszy chłód',
    'Rzeczy, które zostają ze mną na dłużej',
    'O tym, dlaczego nie musimy być zawsze dostępne'
)
OR category NOT IN ('kuchnia', 'filmy', 'książka', 'technologia', 'sport', 'dlaczego?', 'inne');