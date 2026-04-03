
export async function findOne({
  model,
  filters = {},
  selelct = "",
  populate = false,
  populateField = "",
}) {
  let result = "";
  if (populate) {
    result = await model
      .findOne(filters)
      .select(selelct)
      .populate(populateField);
  } else {
    result = await model.findOne(filters).select(selelct);
  }
  return result;
}

export async function Create({ model, data, Options = {} }) {
  const result = await model.create([data], Options);
  return result;
}

export async function findById({
  model,
  id,
  selelct = "",
  populate = false,
  populateField = "",
}) {
  let result = "";
  if (populate) {
    result = await model.findById(id).select(selelct).populate(populateField);
  } else {
    result = await model.findById(id).select(selelct);
  }
  return result;
}

export async function updateOne({ model, filter, data, option }) {
  const result = await model.updateOne(filter, data, option);
  return result;
}

export async function Find({
  model,
  filter = {},
  select = "",
  populate = false,
  populateField,
}) {
  let result;
  if (populate) {
    result = await model.find(filter).select(select).populate(populateField);
  } else {
    result = await model.find(filter).select(select);
  }
  return result
}
export async function Delete({model,filters={},options}){
  return await model.deleteOne(filters,options)
}
