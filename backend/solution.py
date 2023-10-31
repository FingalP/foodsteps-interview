import csv
import json
from decimal import Decimal

def make_minimal(word):
    """
    Removes certain special characters from a string and converts it to lowercase.

    Args:
        word (str): The string to be processed.

    Returns:
        str: The processed string.
    """
    for char in [
        "'",
        '"',
        " ",
        "(",
        ")",
        "-",
        "_",
        ",",
        ".",
        "/",
        ">",
        "+",
        "–",
        "’",
        "!",
        "…",
        "=",
    ]:
        word = word.replace(char, "")
    return word.strip().lower()


def split_and_make_minimal(name):
    """
    Splits a string into words, processes each word, and returns the sorted list of processed words.

    Args:
        name (str): The string to be split and processed.

    Returns:
        list: The sorted list of processed words.
    """

    return sorted([make_minimal(word) for word in name.split(" ")])


def fuzzy_match_food_name(food_name_1, food_name_2):
    """
    Checks if two food names match after processing and sorting the words in the names.

    Args:
        food_name_1 (str): The first food name.
        food_name_2 (str): The second food name.

    Returns:
        bool: True if the processed and sorted names match, False otherwise.
    """

    if split_and_make_minimal(food_name_1) == split_and_make_minimal(food_name_2):
        return True
    return False


def get_closest_food_class_with_impact(food_name, food_classes):
    """
    Returns the food class with the given name if it has a non-empty value for impact,
    or finds the closest parent with a non-empty value for impact.

    Args:
        food_name (str): The name of the food.
        food_classes (list): The list of food classes.

    Returns:
        dict: The food class with impact or None if not found.
    """
    food_class = next(
        (fc for fc in food_classes if fuzzy_match_food_name(fc["Name"], food_name)),
        None,
    )
    while True:
        if food_class is None:
            return None
        if food_class["Impact / kg"] != "":
            return food_class
        if food_class["Parent ID"] == "":
            return None
        food_class = next(
            (fc for fc in food_classes if fc["ID"] == food_class["Parent ID"]), None
        )


def get_impact_for_ingredient(recipe_row, food_classes):
    """
    Calculates the impact for a given ingredient.

    Args:
        recipe_row (dict): The recipe row containing the ingredient information.
        food_classes (list): The list of food classes.

    Returns:
        Decimal: The impact for the ingredient or None if not found.
    """
    food_class = get_closest_food_class_with_impact(
        recipe_row["Ingredient Name"], food_classes
    )
    if food_class is None:
        print(recipe_row["Ingredient Name"])
        return None
    return Decimal(food_class["Impact / kg"]) * Decimal(
        recipe_row["Ingredient Weight / kg"]
    )


def get_impact_for_recipe(recipe_rows, food_classes):
    """
    Calculates the total impact for a given recipe.

    Args:
        recipe_rows (list): The list of recipe rows.
        food_classes (list): The list of food classes.

    Returns:
        Decimal: The total impact for the recipe or None if any ingredient impact is not found.
    """

    impacts = [
        get_impact_for_ingredient(recipe_row, food_classes)
        for recipe_row in recipe_rows
    ]
    if any([impact is None for impact in impacts]):
        return None
    return sum(impacts)


def load_recipes_and_classes_and_calculate_impacts():
    """
    Loads the recipes and food classes from CSV files and calculates the impacts.

    Returns:
        dict: The calculated impacts for the recipes.
    """
    recipes = {}
    with open("../recipes.csv") as f:
        recipe_reader = csv.DictReader(f)
        for recipe_row in recipe_reader:
            if recipe_row["Recipe ID"] not in recipes.keys():
                recipes[recipe_row["Recipe ID"]] = []
            recipes[recipe_row["Recipe ID"]].append(recipe_row)

    food_classes = []
    with open("../food_classes.csv") as f:
        food_classes_reader = csv.DictReader(f)
        for food_class_row in food_classes_reader:
            food_classes.append(food_class_row)

    results = {}
    for recipe_id, recipe_rows in recipes.items():
        recipe_name = next(
            (recipe_row["Recipe Name"] for recipe_row in recipe_rows), None
        )
        results[f"{recipe_name} (id {recipe_id})"] = str(get_impact_for_recipe(
            recipe_rows, food_classes
        ))

    return results


if __name__ == "__main__":
    results = load_recipes_and_classes_and_calculate_impacts()
    print(json.dumps(results, indent=4))
