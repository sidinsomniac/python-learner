def best_profit(prices):
    best = 0
    cheapest = None
    for price in prices:
        if cheapest is None or price < cheapest:
            cheapest = price
        elif price - cheapest > best:
            best = price - cheapest
    return best
